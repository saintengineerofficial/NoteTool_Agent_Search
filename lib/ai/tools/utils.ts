export type ToolErrorType = "rate_limit" | "auth" | "network" | "timeout" | "empty_result" | "invalid_format" | "unknown"

export type ToolResult<T> = {
  code: number
  message: string
  data: T | null
  errorType?: ToolErrorType
}

export const withTimeout = async <T>(p: Promise<T>, ms = 12000) =>
  await Promise.race([p, new Promise<T>((_, rej) => setTimeout(() => rej(new Error("TIMEOUT")), ms))])

export function ok<T>(data: T, message = "success"): ToolResult<T> {
  return { code: 200, message, data }
}

export function fail(message: string, errorType: ToolErrorType = "unknown", code = 500): ToolResult<null> {
  return { code, message, data: null, errorType }
}

export function classifyToolError(error: unknown): ToolErrorType {
  const msg = error instanceof Error ? error.message : String(error)
  if (/TIMEOUT/i.test(msg)) return "timeout"
  if (/401|unauthorized|forbidden/i.test(msg)) return "auth"
  if (/429|rate limit/i.test(msg)) return "rate_limit"
  if (/ENOTFOUND|ECONNREFUSED|ECONNRESET|ETIMEDOUT|network/i.test(msg)) return "network"
  return "unknown"
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    retries?: number
    baseDelayMs?: number
    shouldRetry?: (error: unknown) => boolean
  } = {}
): Promise<T> {
  const { retries = 2, baseDelayMs = 300, shouldRetry } = options
  let attempt = 0
  while (true) {
    try {
      return await fn()
    } catch (error) {
      attempt += 1
      const retryable = shouldRetry ? shouldRetry(error) : false
      if (!retryable || attempt > retries) throw error
      const delay = baseDelayMs * Math.pow(2, attempt - 1)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
}
