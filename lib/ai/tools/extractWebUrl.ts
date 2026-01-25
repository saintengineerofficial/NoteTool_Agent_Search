import { tool } from "ai"
import z from "zod"
import { tavily } from "@tavily/core"
import { classifyToolError, fail, ok, retryWithBackoff, withTimeout } from "./utils"

const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY })

export const extractWebUrl = () =>
  tool({
    description:
      "Extract content from one or more URLs. Use this to retrieve, summarize, or analyze page content. Returns structured data per page including URL, title, content, and favicon.",
    inputSchema: z.object({
      urls: z.array(z.url().describe("Website url")),
    }),
    execute: async ({ urls }) => {
      try {
        const response = await retryWithBackoff(
          () =>
            withTimeout(
              tvly.extract(urls, {
                includeFavicon: true,
                includeImages: true,
                topoc: "general",
                format: "markdown",
                extractDepth: "basic",
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
        // console.log("🚀 ~ webSearch ~ response:", response)

        const results = response.results.map(r => ({
          url: r.url,
          content: r.rawContent,
          favicon: r.favicon || null,
        }))

        const data = {
          urls,
          results,
          responseTime: response.responseTime,
        }
        if (results.length === 0) {
          return { ...ok(data, "no results"), errorType: "empty_result" }
        }
        return ok(data)
      } catch (error) {
        const errorType = classifyToolError(error)
        return fail(error instanceof Error ? error.message : "Extract url content failed", errorType)
      }
    },
  })
