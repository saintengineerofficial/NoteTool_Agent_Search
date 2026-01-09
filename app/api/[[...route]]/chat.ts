import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import z, { string } from "zod"
import { getAuthUser } from "@/lib/hono/hono-middlware"
import prisma from "@/lib/prisma"
import { HTTPException } from "hono/http-exception"
import { convertToModelMessages, stepCountIs, streamText, type UIMessage, type UIMessagePart } from "ai"
import { DEVELOPMENT_CHAT_MODEL, type ChatModel } from "@/lib/ai/models"
import { generateTitleForUserMessage } from "@/lib/actions"
import { isProduction, ModelProvider } from "@/lib/ai/providers"
import { generateUUID } from "@/lib/utils"

const chatSchema = z.object({
  id: z.string().min(1),
  message: z.custom<UIMessage>(),
  // selectedModel: z.custom<ChatModel["id"]>(),
  selectedModelId: z.string() as z.ZodType<ChatModel["id"]>,
  selectedToolName: z.string().nullable(),
})

const chatIdSchema = z.object({
  id: z.string().min(1),
})

export const chatRoute = new Hono().post("/", zValidator("json", chatSchema), getAuthUser, async c => {
  try {
    const user = c.get("user")
    const { id, message, selectedModelId, selectedToolName } = c.req.valid("json")
    console.log("🚀 ~ message:", message)

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
      orderBy: { createdAt: "desc" },
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

    // const modelProvider = isProduction ? ModelProvider.languageModel(selectedModelId) : ModelProvider.languageModel(DEVELOPMENT_CHAT_MODEL)
    const modelProvider = ModelProvider.languageModel(DEVELOPMENT_CHAT_MODEL)

    const result = streamText({
      model: modelProvider,
      messages: modelMessages,
      stopWhen: stepCountIs(5),
      // tools: [],
      toolChoice: "auto",
      onError({ error }) {
        console.error(error)
      },
    })

    return result.toUIMessageStreamResponse({
      sendSources: true,
      generateMessageId: () => generateUUID(),
      originalMessages: newUIMessages,
      onFinish: async ({ messages, responseMessage }) => {
        console.log("🚀 ~ messages, responseMessage:", messages, responseMessage)
        try {
          await prisma.message.createMany({
            data: messages.map(m => ({
              id: m.id || generateUUID(),
              role: m.role,
              parts: JSON.parse(JSON.stringify(message.parts)),
              chatId: chat.id,
              createdAt: new Date(),
              updatedAt: new Date(),
            })),
            skipDuplicates: true, // 避免重复
          })
        } catch (error) {
          console.log("error", error)
        }
      },
    })
  } catch (error) {
    if (error instanceof HTTPException) {
      throw error
    }
    throw new HTTPException(500, { message: "Internal server error" })
  }
})
