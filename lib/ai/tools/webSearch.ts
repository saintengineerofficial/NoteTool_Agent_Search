import { tool } from "ai"
import z from "zod"
import { tavily } from "@tavily/core"

const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY })

export const webSearch = () =>
  tool({
    description: "Search the web for current information. Use when you need up-to-date info or when user asks to search the internet.",
    inputSchema: z.object({
      query: z.string().describe("Search web query"),
    }),
    execute: async ({ query }) => {
      try {
        const response = await tvly.search(query, {
          includeAnswer: true,
          includeFavicon: true,
          includeImages: false,
          maxResults: 3,
        })
        console.log("🚀 ~ webSearch ~ response:", response)

        const results = response.results.map(r => ({
          title: r.title,
          url: r.url,
          content: r.content,
          // favicon: r.favicon || null,
        }))

        return {
          code: 200,
          message: "success",
          data: {
            answers: response.answer || "no summary available",
            results,
            responseTime: response.responseTime,
          },
        }
      } catch (error) {
        return {
          code: 500,
          message: error instanceof Error ? error.message : "Web search failed",
          data: null,
        }
      }
    },
  })
