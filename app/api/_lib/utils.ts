export type ToolErrorType = "rate_limit" | "auth" | "network" | "timeout" | "empty_result" | "invalid_format" | "unknown"

export function decideToolErrorNotice(errorType: ToolErrorType | undefined) {
  switch (errorType) {
    case "rate_limit":
      return "工具调用触发限流，请稍后再试或缩小请求范围。"
    case "auth":
      return "工具认证失败，请检查相关配置后重试。"
    case "network":
    case "timeout":
      return "工具调用网络异常/超时，请稍后再试。"
    case "empty_result":
      return "工具没有返回结果，请尝试换个关键词或补充细节。"
    case "invalid_format":
      return "工具输入格式可能不正确，请调整输入后再试。"
    default:
      return null
  }
}
