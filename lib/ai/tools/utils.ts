export const withTimeout = async <T>(p: Promise<T>, ms = 12000) =>
  await Promise.race([p, new Promise<T>((_, rej) => setTimeout(() => rej(new Error("TIMEOUT")), ms))])
