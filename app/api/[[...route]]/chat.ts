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
import { generateUUID } from "@/lib/utils"
import { createNote } from "@/lib/ai/tools/creatNote"
import { searchNote } from "@/lib/ai/tools/searchNote"
import { webSearch } from "@/lib/ai/tools/webSearch"
import { extractWebUrl } from "@/lib/ai/tools/extractWebUrl"
import { getSystemPrompt } from "@/lib/ai/prompt"
import { handleToolRequest, planTask, executeTool, decideNextStep, setRequiresConfirm } from "@/lib/stat"

function extractUserText(parts: UIMessagePart<any, any>[]): string {
  const texts = parts
    .filter((part: any) => part?.type === "text" && typeof part?.text === "string")
    .map((part: any) => part.text)
  return texts.join("").trim()
}

const chatSchema = z.object({
  id: z.string().min(1),
  message: z.custom<UIMessage>(),
  selectedModelId: z.string() as z.ZodType<ChatModel["id"]>,
  selectedToolName: z.string().nullable(),
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

      // 处理工具请求, 状态机判断
      const selectedTool = selectedToolName ?? null
      const toolName = selectedTool ?? "auto"
      const inputSnapshot = JSON.stringify(message.parts)
      const userText = extractUserText(message.parts)
      const isConfirm = /^(确认|确认继续|confirm)$/i.test(userText)
      if (isConfirm) {
        setRequiresConfirm(false)
      }
      let action = handleToolRequest(toolName, inputSnapshot)
      if (action.type === "plan") {
        action = planTask(action.toolName, action.input)
      }
      if (action.type === "confirm") {
        return c.json({ code: 409, message: action.message, data: null }, 409)
      }
      if (action.type === "respond") {
        return c.json({ code: 400, message: action.message, data: null }, 400)
      }

      let chat = await prisma.chat.findUnique({
        where: { id },
      })

      if (!chat) {
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

      const toolChoice = selectedTool ?
        ({ type: "tool", toolName: selectedTool as keyof typeof tools } as const) : "auto"
      
      // const modelProvider = isProduction ? ModelProvider.languageModel(selectedModelId) : ModelProvider.languageModel(DEVELOPMENT_CHAT_MODEL)
      const modelProvider = ModelProvider.languageModel(DEVELOPMENT_CHAT_MODEL)

      const result = streamText({
        model: modelProvider,
        messages: modelMessages,
        system: getSystemPrompt(selectedToolName),
        stopWhen: stepCountIs(5),
        tools,
        toolChoice,
        onError({ error }) {
          console.error("streamText onError:", error)
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
            const postAction = executeTool(toolName)
            if (postAction.type === "decide") {
              decideNextStep()
            }
            await prisma.message.createMany({
              data: messages.map(m => ({
                id: m.id || generateUUID(),
                role: m.role,
                parts: JSON.parse(JSON.stringify(m.parts)),
                chatId: chat.id,
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
      console.log("🚀 ~ chat:", chat)

      if (!chat) {
        return c.json({ code: 200, message: "success", data: null })
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
