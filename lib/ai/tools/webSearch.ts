import { tool } from "ai"
import z from "zod"
import { tavily } from "@tavily/core"
import { classifyToolError, fail, ok, retryWithBackoff, withTimeout } from "./utils"

const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY })

export const webSearch = () =>
  tool({
    description: "Search the web for current information. Use when you need up-to-date info or when user asks to search the internet.",
    inputSchema: z.object({
      query: z.string().describe("Search web query"),
    }),
    execute: async ({ query }) => {
      try {
        const response = await retryWithBackoff(
          () =>
            withTimeout(
              tvly.search(query, {
                includeAnswer: true,
                includeFavicon: true,
                includeImages: false,
                maxResults: 5,
              }),
              12000
            ),
          {
            retries: 2,
            shouldRetry: err => {
              const type = classifyToolError(err)
              return type === "rate_limit" || type === "timeout" || type === "network"
            },
          }
        )

        const results = response.results.map(r => ({
          title: r.title,
          url: r.url,
          content: (r.content ?? "").slice(0, 800), // ✅ 裁剪
        }))

        // console.log("🚀 ~ webSearch ~ response:", response)

        const data = {
          answers: response.answer || "no summary available",
          results,
          responseTime: response.responseTime,
        }
        if (results.length === 0) {
          return { ...ok(data, "no results"), errorType: "empty_result" }
        }
        return ok(data)
      } catch (error) {
        const errorType = classifyToolError(error)
        return fail(error instanceof Error ? error.message : "Web search failed", errorType)
      }
    },
  })
