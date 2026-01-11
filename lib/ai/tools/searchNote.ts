import prisma from "@/lib/prisma"
import { tool } from "ai"
import z from "zod"

export const searchNote = (userId: string) =>
  tool({
    description: "Search through the user's notes by keywords in title or content. Use this when the user asks to find or search or lookup notes.",
    inputSchema: z.object({
      query: z.string().describe("search query to find in notes"),
      limit: z.number().optional().describe("Maximum number of resultes (default 10)"),
    }),
    execute: async ({ query, limit = 10 }) => {
      try {
        const notes = await prisma.note.findMany({
          where: {
            userId,
            // 满足任意一个分支就算匹配
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { content: { contains: query, mode: "insensitive" } }, //insensitive大小写不敏感。
            ],
          },
          orderBy: { createdAt: "desc" },
          take: limit,
          select: {
            id: true,
            title: true,
            content: true,
            createdAt: true,
          },
        })

        return {
          code: 200,
          message: `Found ${notes.length} notes matching "${query}"`,
          data: notes,
        }
      } catch (error) {
        return {
          code: 500,
          data: null,
          message: error instanceof Error ? error.message : "Failed to search note..",
        }
      }
    },
  })
