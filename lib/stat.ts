// 定义状态类型
type ChatState = "idle" | "plan" | "tool_call" | "tool_result" | "decide"

interface Chat {
  state: ChatState // 当前状态
  lastTool: string | null // 上次执行的工具
  lastResultSummary: string | null // 上次工具执行的结果摘要
  requiresConfirm: boolean // 是否需要用户确认
}

// 初始状态
let chat: Chat = {
  state: "idle", // 初始状态是 `idle`
  lastTool: null,
  lastResultSummary: null,
  requiresConfirm: false,
}

// 更新状态的函数
export function updateChatState(newState: ChatState, toolName: string | null = null, resultSummary: string | null = null) {
  chat.state = newState
  chat.lastTool = toolName
  chat.lastResultSummary = resultSummary
  console.log(`Chat state updated to ${newState} (Tool: ${toolName}, Summary: ${resultSummary})`)
}

// 工具调用的核心函数
export function handleToolRequest(toolName: string, input: string) {
  switch (chat.state) {
    case "idle":
      // 进入 plan 阶段，开始任务规划
      updateChatState("plan")
      return planTask(toolName, input) // 调用任务规划
    case "plan":
      // 任务规划完成，进入 tool_call 阶段
      updateChatState("tool_call", toolName)
      return executeTool(toolName) // 执行工具
    case "tool_result":
      // 工具执行完成，进入 decide 阶段，决定下一步
      updateChatState("decide")
      return decideNextStep() // 判断是否继续任务或返回
    default:
      // 当前状态不允许执行工具
      throw new Error(`Invalid state for tool execution: ${chat.state}`)
  }
}

// 判断是否需要拆解任务
export function shouldSplitTask(input: string): boolean {
  return input.length > 300 || /比较|总结|保存/.test(input) // 示例：输入超过 300 字符或包含多个目标动词
}

// 拆解任务
export function splitTask(input: string): string[] {
  console.log("Splitting task into multiple steps...")
  // 这里只是示例，实际中会拆解成多个具体的步骤
  return [input] // 目前简单返回原任务，实际应用中会拆成多步
}

// 任务规划阶段：检查是否需要拆解任务
export function planTask(toolName: string, input: string) {
  if (shouldSplitTask(input)) {
    const tasks = splitTask(input)
    tasks.forEach(task => handleToolRequest(toolName, task)) // 处理每个拆解后的任务
  } else {
    handleToolRequest(toolName, input) // 直接执行任务
  }
}

// 执行工具的核心逻辑
export function executeTool(toolName: string) {
  console.log(`Executing tool: ${toolName}`)
  updateChatState("tool_result", toolName)
  return getToolResult(toolName) // 获取工具结果
}

// 获取工具执行结果
export function getToolResult(toolName: string) {
  console.log(`Getting result for tool: ${toolName}`)
  updateChatState("decide")
  return decideNextStep() // 继续处理工具结果，决定是否继续
}

// 决策阶段：判断下一步
export function decideNextStep() {
  console.log("Deciding next step based on tool result")
  return "Task completed" // 示例，实际情况根据任务结果进行不同操作
}
