export const fetchWithHeaderTimeout = async (input: RequestInfo | URL, init?: RequestInit, timeoutMs = 15000) => {
  const controller = new AbortController()
  const externalSignal = init?.signal

  if (externalSignal && !externalSignal.aborted) {
    externalSignal.addEventListener("abort", () => controller.abort(externalSignal.reason), { once: true })
  }

  const timeoutId = setTimeout(() => controller.abort("timeout"), timeoutMs)
  const res = await fetch(input, { ...init, signal: controller.signal })
  clearTimeout(timeoutId)
  return res
}
