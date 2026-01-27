// 定义状态类型
type ChatState = "idle" | "plan" | "tool_call" | "tool_result" | "decide"

interface Chat {
  state: ChatState // 当前状态
  lastTool: string | null // 上次执行的工具
  lastResultSummary: string | null // 上次工具执行的结果摘要
  requiresConfirm: boolean // 是否需要用户确认
}

type Action =
  | { type: "plan"; toolName: string; input: string }
  | { type: "call_tool"; toolName: string }
  | { type: "decide" }
  | { type: "confirm"; message: string }
  | { type: "respond"; message: string }

const confirmMessage = "需要确认：请“确认”以继续执行下一步。"

const chatStateStore = new Map<string, Chat>()

function getChatState(chatId: string): Chat {
  const existing = chatStateStore.get(chatId)
  if (existing) {
    return existing
  }
  // 初始状态
  const initState: Chat = {
    state: "idle",
    lastTool: null,
    lastResultSummary: null,
    requiresConfirm: false,
  }
  chatStateStore.set(chatId, initState)
  return initState
}

// 更新状态的函数
export function updateChatState(
  chatId: string,
  newState: ChatState,
  toolName: string | null = null,
  resultSummary: string | null = null,
  requiresConfirm: boolean = false
) {
  console.log("🚀 ~ updateChatState ~ newState:", newState)

  const chat = getChatState(chatId)
  chat.state = newState
  chat.lastTool = toolName
  chat.lastResultSummary = resultSummary
  chat.requiresConfirm = requiresConfirm
}

export function setRequiresConfirm(chatId: string, value: boolean) {
  const chat = getChatState(chatId)
  chat.requiresConfirm = value
}

// 工具调用的核心函数
export function handleToolRequest(chatId: string, toolName: string, input = ""): Action {
  const chat = getChatState(chatId)
  if (chat.requiresConfirm) {
    return { type: "confirm", message: confirmMessage }
  }
  switch (chat.state) {
    case "idle":
      updateChatState(chatId, "plan", null, null, false)
      return { type: "plan", toolName, input }

    case "plan":
      updateChatState(chatId, "tool_call", toolName, null, false)
      return { type: "call_tool", toolName }

    case "tool_call":
      updateChatState(chatId, "tool_result", toolName, null, false)
      return { type: "call_tool", toolName }

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
export function planTask(chatId: string, toolName: string, input: string): Action {
  if (toolName === "createNote") {
    // 写入类工具需要显式确认，避免误写
    setRequiresConfirm(chatId, true)
    return { type: "confirm", message: confirmMessage }
  }
  if (input && shouldSplitTask(input)) {
    // 多步骤任务需要用户确认，避免工具链失控
    setRequiresConfirm(chatId, true)
    return { type: "confirm", message: confirmMessage }
  }
  updateChatState(chatId, "tool_call", toolName, null, false)
  return { type: "call_tool", toolName }
}

// 执行工具的核心逻辑
export function executeTool(chatId: string, toolName: string): Action {
  // 执行工具不在这里发生，只是状态转移与动作返回
  updateChatState(chatId, "tool_result", toolName)
  return { type: "decide" }
}

// 获取工具执行结果
// export function getToolResult(toolName: string) {
//   console.log(`Getting result for tool: ${toolName}`)
//   updateChatState("decide")
//   return decideNextStep() // 继续处理工具结果，决定是否继续
// }

// 决策阶段：判断下一步
export function decideNextStep(chatId: string): Action {
  updateChatState(chatId, "idle", null, null, false)
  return { type: "respond", message: "Task completed" }
}

export function resetChatState(chatId: string) {
  updateChatState(chatId, "idle", null, null, false)
}
