const RETRY_STATUSES = new Set([408, 429, 500, 502, 503, 504])
const RETRY_TIMES = 2
const TIMEOUT_MS = 20000

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const fetchWithRetry = async (input: RequestInfo | URL, init?: RequestInit) => {
  const retries = RETRY_TIMES
  let lastError: unknown

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    // 用于在超时或手动取消时中止请求
    const controller = new AbortController()
    // 设置超时时间20s
    const timeoutId = setTimeout(() => controller.abort("timeout"), TIMEOUT_MS)

    // 外部信号，用于在手动取消时中止请求
    const externalSignal = init?.signal
    const userAborted = externalSignal?.aborted
    if (externalSignal && !externalSignal.aborted) {
      externalSignal.addEventListener("abort", () => controller.abort(externalSignal.reason), { once: true })
    }

    try {
      const res = await fetch(input, { ...init, signal: controller.signal })
      clearTimeout(timeoutId)

      // 如果请求成功，请求失败但不是重试状态，达到最大重试次数
      if (res.ok || !RETRY_STATUSES.has(res.status) || attempt === retries) {
        return res
      }
    } catch (error) {
      clearTimeout(timeoutId)
      lastError = error
      // 外部中止
      if (userAborted || attempt === retries) {
        throw error
      }
    }

    await sleep(300 * (attempt + 1))
  }

  throw lastError
}



