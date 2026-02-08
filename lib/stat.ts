import { redis } from "@/lib/redis"

// 定义状态类型
type ChatState = "idle" | "plan" | "tool_call" | "tool_result" | "decide"

interface Chat {
  state: ChatState // 当前状态
  lastTool: string | null // 上次执行的工具
  lastResultSummary: string | null // 上次工具执行的结果摘要
  requiresConfirm: boolean // 是否需要用户确认
  pendingTool: string | null
  pendingInput: string | null
}

type Action =
  | { type: "plan"; toolName: string; input: string }
  | { type: "call_tool"; toolName: string }
  | { type: "decide" }
  | { type: "confirm"; message: string }
  | { type: "respond"; message: string }

const confirmMessage = "需要确认：请“确认”以继续执行下一步。"

const keyOf = (chatId: string) => `chat:state:${chatId}`
async function saveChatState(chatId: string, chat: Chat) {
  await redis.set(keyOf(chatId), JSON.stringify(chat), { ex: 1800 })
}

export async function getChatState(chatId: string): Promise<Chat> {
  const cached = await redis.get<Chat>(keyOf(chatId))
  if (cached) return cached

  const init: Chat = {
    state: "idle",
    lastTool: null,
    lastResultSummary: null,
    requiresConfirm: false,
    pendingTool: null,
    pendingInput: null,
  }
  await saveChatState(chatId, init)
  return init
}

// 更新状态的函数
export async function updateChatState(
  chatId: string,
  newState: ChatState,
  toolName: string | null = null,
  resultSummary: string | null = null,
  requiresConfirm = false,
  pendingTool: string | null = null,
  pendingInput: string | null = null
) {
  const chat = await getChatState(chatId)
  chat.state = newState
  chat.lastTool = toolName
  chat.lastResultSummary = resultSummary
  chat.requiresConfirm = requiresConfirm
  chat.pendingTool = pendingTool
  chat.pendingInput = pendingInput
  await saveChatState(chatId, chat)
  return chat
}

export async function setRequiresConfirm(chatId: string, value: boolean) {
  const chat = await getChatState(chatId)
  chat.requiresConfirm = value
  await saveChatState(chatId, chat)
}

// 工具调用的核心函数
export async function handleToolRequest(chatId: string, toolName: string, input = ""): Promise<Action> {
  const chat = await getChatState(chatId)
  if (chat.requiresConfirm) {
    return { type: "confirm", message: confirmMessage }
  }
  switch (chat.state) {
    case "idle":
      await updateChatState(chatId, "plan", null, null, false)
      return { type: "plan", toolName, input }
    case "plan":
      await updateChatState(chatId, "tool_call", toolName, null, false)
      return { type: "call_tool", toolName }

    case "tool_call":
      return { type: "respond", message: "Tool is already running. Please wait." }

    case "tool_result":
      updateChatState(chatId, "decide", null, null, false)
      return { type: "decide" }

    default:
      return { type: "respond", message: `Invalid state: ${chat.state}` }
  }
}

// 判断是否需要拆解任务
export function shouldSplitTask(input: string): boolean {
  // 输入超过 300 字符或包含多个目标动词
  return input.length > 300 || /比较|总结|保存/.test(input)
}

// 拆解任务
export function splitTask(input: string): string[] {
  // 这里只保留占位逻辑，拆解的结果交由上层执行
  return [input]
}

// 任务规划阶段：检查是否需要拆解任务
// lib/stat.ts
export async function planTask(chatId: string, toolName: string, input: string): Promise<Action> {
  const needConfirm = toolName === "createNote" || (input && shouldSplitTask(input))

  if (needConfirm) {
    const pendingTool = toolName !== "auto" ? toolName : null
    const pendingInput = toolName !== "auto" ? input : null

    await updateChatState(chatId, "plan", null, null, true, pendingTool, pendingInput)
    return { type: "confirm", message: confirmMessage }
  }

  await updateChatState(chatId, "tool_call", toolName, null, false)
  return { type: "call_tool", toolName }
}

// 执行工具的核心逻辑
export async function executeTool(chatId: string, toolName: string): Promise<Action> {
  // 执行工具不在这里发生，只是状态转移与动作返回
  await updateChatState(chatId, "tool_result", toolName)
  return { type: "decide" }
}

// 获取工具执行结果
// export function getToolResult(toolName: string) {
//   console.log(`Getting result for tool: ${toolName}`)
//   updateChatState("decide")
//   return decideNextStep() // 继续处理工具结果，决定是否继续
// }

// 决策阶段：判断下一步
export async function decideNextStep(chatId: string): Promise<Action> {
  await updateChatState(chatId, "idle", null, null, false)
  return { type: "respond", message: "Task completed" }
}

export async function resetChatState(chatId: string) {
  await updateChatState(chatId, "idle", null, null, false, null, null)
}
