import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import z from "zod"
import { getAuthUser } from "@/lib/hono/hono-middlware"
import prisma from "@/lib/prisma"
import { HTTPException } from "hono/http-exception"
import { convertToModelMessages, stepCountIs, streamText, type UIMessage, type UIMessagePart } from "ai"
import { DEVELOPMENT_CHAT_MODEL, type ChatModel } from "@/lib/ai/models"
import { generateTitleForUserMessage } from "@/lib/ai/actions"
import { isProduction, ModelProvider } from "@/lib/ai/providers"
import { extractUserText, generateUUID } from "@/lib/utils"
import { createNote } from "@/lib/ai/tools/createNote"
import { searchNote } from "@/lib/ai/tools/searchNote"
import { webSearch } from "@/lib/ai/tools/webSearch"
import { extractWebUrl } from "@/lib/ai/tools/extractWebUrl"
import { getSystemPrompt } from "@/lib/ai/prompt"
import { handleToolRequest, planTask, executeTool, decideNextStep, setRequiresConfirm, resetChatState, getChatState } from "@/lib/stat"
import { decideToolErrorNotice, ToolErrorType } from "../_lib/utils"

const ToolNameSchema = z.enum(["createNote", "searchNote", "webSearch", "extractWebUrl"])
const chatSchema = z.object({
  id: z.string().min(1),
  message: z.custom<UIMessage>(),
  selectedModelId: z.string() as z.ZodType<ChatModel["id"]>,
  selectedToolName: ToolNameSchema.nullable(),
})

const chatIdSchema = z.object({
  id: z.string().min(1),
})

export const chatRoute = new Hono()
  .post("/", zValidator("json", chatSchema), getAuthUser, async c => {
    // 前端只发最后一条 UI message + chatId，后端用 id 去 DB 拉历史 → 组装 modelMessages → streamText + tools + stopWhen → toUIMessageStreamResponse 回给 useChat
    try {
      const user = c.get("user")
      const { id, message, selectedModelId, selectedToolName } = c.req.valid("json")
      // console.log("🚀 ~ message:", message)
      const chatId = id

      const abortSignal = c.req.raw.signal
      abortSignal?.addEventListener(
        "abort",
        () => {
          resetChatState(chatId)
        },
        { once: true }
      )

      // 处理工具请求, 状态机判断
      const selectedTool = selectedToolName ?? null
      let toolName = selectedTool ?? "auto"
      let inputSnapshot = JSON.stringify(message?.parts) || ""

      // redis
      const state = await getChatState(chatId)

      const userText = extractUserText(message?.parts)
      // 写入操作的时候要确认
      const isConfirm = /^(确认|确认继续|confirm|yes|y|ok|okay|继续)$/i.test(userText)

      if (isConfirm) {
        if (!state.requiresConfirm || !state.pendingTool) {
          return c.json({ code: 409, message: "当前无待确认的工具步骤", data: null }, 409)
        }
        await setRequiresConfirm(chatId, false)
        toolName = state.pendingTool
        inputSnapshot = state.pendingInput ?? inputSnapshot
      } else {
        if (state.state !== "idle") {
          return c.json({ code: 409, message: "当前对话流程未完成，请先确认或等待结束", data: null }, 409)
        }
        if (state.requiresConfirm) {
          return c.json({ code: 409, message: "需要确认：请“确认”以继续执行下一步。", data: null }, 409)
        }
      }
      // 状态机类型
      let action = await handleToolRequest(chatId, toolName, inputSnapshot)
      if (action.type === "plan") {
        action = await planTask(chatId, action.toolName, action.input)
      }
      if (action.type === "confirm") {
        return c.json({ code: 409, message: action.message, data: { requiresConfirm: true, confirmMessage: action.message } }, 409)
      }
      if (action.type === "respond") {
        return c.json({ code: 400, message: action.message, data: null }, 400)
      }
      if (action.type === "decide") {
        await decideNextStep(chatId)
        return c.json({ code: 409, message: "Unexpected decide state. Please retry.", data: null }, 409)
      }

      // 开始查询
      let chat = await prisma.chat.findFirst({
        where: { id, userId: user.id },
      })

      if (!chat) {
        const existChat = await prisma.chat.findUnique({ where: { id } })
        // 避免不属于用户的chatId执行
        if (existChat) {
          return c.json({ code: 403, message: "Forbidden: chat does not belong to you", data: null }, 403)
        }
        const title = await generateTitleForUserMessage({ message })
        chat = await prisma.chat.create({
          data: {
            id,
            userId: user.id,
            title,
          },
        })
      }

      const messageFromDB = await prisma.message.findMany({
        where: { chatId: chat.id },
        orderBy: { createdAt: "asc" },
      })

      const mapUIMessages = messageFromDB.map(m => ({
        id: m.id,
        role: m.role as "user" | "assistant" | "system",
        parts: m.parts as UIMessagePart<any, any>[],
        metadata: {
          createdAt: m.createdAt,
        },
      }))

      // 添加新的消息
      const newUIMessages = [...mapUIMessages, message]

      // 转换成 model 格式
      const modelMessages = convertToModelMessages(newUIMessages)
      // console.log("🚀 ~ modelMessages:", modelMessages)

      // 新的消息创建到数据库
      await prisma.message.create({
        data: {
          id: message.id,
          role: "user",
          parts: JSON.parse(JSON.stringify(message.parts)),
          chatId: chat.id,
        },
      })

      const tools = {
        createNote: createNote(user.id),
        searchNote: searchNote(user.id),
        webSearch: webSearch(),
        extractWebUrl: extractWebUrl(),
      } as const
      
      const forcedToolName = (toolName !== "auto" ? toolName : null) as keyof typeof tools
      const toolVar = forcedToolName ? ({ type: "tool", toolName: forcedToolName } as const) : "auto"
      const toolChoice = action.type === "call_tool" ? toolVar : "none"

      // const modelProvider = isProduction ? ModelProvider.languageModel(selectedModelId) : ModelProvider.languageModel(DEVELOPMENT_CHAT_MODEL)
      const modelProvider = ModelProvider.languageModel(DEVELOPMENT_CHAT_MODEL)

      let toolCallCount = 0
      let toolCalledInRun = false

      const result = streamText({
        model: modelProvider,
        messages: modelMessages,
        system: getSystemPrompt(selectedToolName),
        stopWhen: stepCountIs(3),
        tools,
        toolChoice,
        onStepFinish(step) {
          // console.log("🚀 ~ step:", step)

          const toolResults = step.toolResults ?? []
          if (toolResults?.length > 0) {
            // 记录工具状态
            toolCalledInRun = true
            toolCallCount += toolResults.length
            if (toolCallCount > 1 && !(c as any).toolErrorNotice) {
              ;(c as any).toolErrorNotice = "检测到多次工具调用，本次仅支持一次工具调用，请简化请求后重试。"
            }
          }
          // 记录工具错误，用于在响应后给用户提示
          for (const r of toolResults) {
            const output = (r as any)?.output
            const errorType = output?.errorType as ToolErrorType | undefined
            const notice = decideToolErrorNotice(errorType)
            if (notice) {
              ;(c as any).toolErrorNotice = notice
              break
            }
          }
        },
        onError({ error }) {
          console.error("streamText onError:", error)
          resetChatState(chatId)
        },
      })

      // 流式
      return result.toUIMessageStreamResponse({
        sendSources: true,
        generateMessageId: () => generateUUID(),
        originalMessages: newUIMessages,
        onFinish: async ({ messages, responseMessage }) => {
          // console.log("🚀 ~ messages, responseMessage:", messages, responseMessage)
          try {
            // 工具状态
            if (toolCalledInRun) {
              const postAction = await executeTool(chatId, toolName)
              if (postAction.type === "decide") {
                await decideNextStep(chatId)
              }
            } else {
              // 重置状态
              resetChatState(chatId)
            }
            const toolErrorNotice = (c as any).toolErrorNotice as string | undefined
            if (toolErrorNotice) {
              messages.push({
                id: generateUUID(),
                role: "assistant",
                parts: [{ type: "text", text: toolErrorNotice }],
              } as any)
            }
            await prisma.message.createMany({
              data: messages.map(m => ({
                id: m.id || generateUUID(),
                role: m.role,
                parts: JSON.parse(JSON.stringify(m.parts)),
                chatId: chat!.id,
                createdAt: new Date(),
                updatedAt: new Date(),
              })),
              skipDuplicates: true, // 避免重复数据插入
            })
          } catch (error) {
            console.log("error", error)
          }
        },
      })
    } catch (error) {
      console.error("model", DEVELOPMENT_CHAT_MODEL)
      console.error("Full error object", JSON.stringify(error, Object.getOwnPropertyNames(error), 2))

      if (error instanceof HTTPException) {
        throw error
      }
      throw new HTTPException(500, {
        message: error instanceof Error ? error.message : "Internal server error",
      })
    }
  })
  .get("/list", getAuthUser, async c => {
    try {
      const user = c.get("user")
      const chats = await prisma.chat.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      })
      return c.json({
        code: 200,
        message: "success",
        data: chats,
      })
    } catch (error) {
      console.log(error)
      throw new HTTPException(500, { message: "Internal server error" })
    }
  })
  .get("/:id", zValidator("param", chatIdSchema), getAuthUser, async c => {
    try {
      const user = c.get("user")
      const { id } = c.req.valid("param")
      const chat = await prisma.chat.findFirst({
        where: { id, userId: user.id },
        include: {
          messages: { orderBy: { createdAt: "asc" } },
        },
        orderBy: { createdAt: "desc" },
      })
      // console.log("🚀 ~ chat:", chat)

      if (!chat) {
        return c.json({ code: 200, message: "Chat not found", data: null })
      }

      const uiMessages = chat.messages.map(m => ({
        id: m.id,
        role: m.role as "user" | "assistant" | "system",
        parts: m.parts as UIMessagePart<any, any>[],
        metadata: {
          createdAt: m.createdAt,
        },
      }))

      return c.json({
        code: 200,
        message: "success",
        data: {
          chat,
          messages: uiMessages,
        },
      })
    } catch (error) {
      console.log(error, "Failed to fetch chat")
      throw new HTTPException(500, { message: "Internal Server error" })
    }
  })
