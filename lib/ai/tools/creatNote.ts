import prisma from "@/lib/prisma"
import { tool } from "ai"
import z from "zod"

export const createNote = (userId: string) =>
  tool({
    description: "Create a note or Save to Note with title and content .  Use this when the user asks to create, save, or make a note.",
    inputSchema: z.object({
      title: z.string().describe("the title of the note"),
      content: z.string().describe("the content of the note"),
    }),
    execute: async ({ title, content }) => {
      console.log("🚀 ~ createNote ~ title, content:", title, content)

      try {
        const note = await prisma.note.create({
          data: {
            userId,
            title,
            content,
          },
        })

        return {
          code: 200,
          messsage: "success",
          data: note,
        }
      } catch (error) {
        return {
          code: 500,
          data: null,
          message: error instanceof Error ? error.message : "Failed to create note..",
        }
      }
    },
  })
