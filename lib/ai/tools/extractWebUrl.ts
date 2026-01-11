import { tool } from "ai"
import z from "zod"
import { tavily } from "@tavily/core"

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
        const response = await tvly.extract(urls, {
          includeFavicon: true,
          includeImages: true,
          topoc: "general",
          format: "markdown",
          extractDepth: "basic",
        })
        console.log("🚀 ~ webSearch ~ response:", response)

        const results = response.results.map(r => ({
          url: r.url,
          content: r.rawContent,
          favicon: r.favicon || null,
        }))

        return {
          code: 200,
          message: "success",
          data: {
            urls,
            results,
            responseTime: response.responseTime,
          },
        }
      } catch (error) {
        return {
          code: 500,
          message: error instanceof Error ? error.message : "Extract url content failed",
          data: null,
        }
      }
    },
  })
