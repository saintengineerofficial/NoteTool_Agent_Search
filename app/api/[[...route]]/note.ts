import { Hono } from "hono"
import { zValidator } from "@hono/zod-validator"
import z, { string } from "zod"
import { getAuthUser } from "@/lib/hono/hono-middlware"
import prisma from "@/lib/prisma"
import { HTTPException } from "hono/http-exception"

const noteCreateSchema = z.object({ title: string().min(1), content: string() })
const noteUpdateSchema = z.object({ id: string().min(1, "Note ID is required"), title: string().min(1), content: string() })
const noteIdSchema = z.object({ id: z.string().min(1, "Note ID is required") })

export const noteRoute = new Hono()
  .post("/create", zValidator("json", noteCreateSchema), getAuthUser, async c => {
    try {
      const { title, content } = c.req.valid("json")
      const user = c.get("user")
      const newNote = await prisma.note.create({
        data: { title, content, userId: user.id },
      })

      return c.json({ code: 200, message: "success", data: newNote })
    } catch (error) {
      console.log(error)
      throw new HTTPException(500, { message: "Failed to create note" })
    }
  })
  .post("/update", zValidator("json", noteUpdateSchema), getAuthUser, async c => {
    try {
      const { id, title, content } = c.req.valid("json")
      const user = c.get("user")
      const exitNote = await prisma.note.findFirst({
        where: { id: id, userId: user.id },
      })

      if (!exitNote) {
        throw new HTTPException(404, { message: "Note not found" })
      }

      const updatedNote = await prisma.note.update({
        where: { id: id },
        data: { title, content },
      })

      return c.json({ code: 200, message: "success", data: updatedNote })
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error
      }
      throw new HTTPException(500, { message: "Internal server error" })
    }
  })
  .post("/delete", zValidator("json", noteIdSchema), getAuthUser, async c => {
    try {
      const { id } = c.req.valid("json")
      const user = c.get("user")
      const exitNote = await prisma.note.findFirst({
        where: { id: id, userId: user.id },
      })
      if (!exitNote) {
        throw new HTTPException(404, { message: "Note not found" })
      }
      await prisma.note.delete({
        where: { id: id },
      })

      return c.json({ code: 200, message: "success" })
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error
      }
      throw new HTTPException(500, { message: "Internal server error" })
    }
  })
  .get("/list", getAuthUser, async c => {
    // console.log("🚀 ~ c:", c)

    try {
      const user = c.get("user")
      const query = c.req.query()

      const page = query.page ? parseInt(query.page, 10) : 1
      const pageSize = query.pageSize ? parseInt(query.pageSize, 10) : 10

      // 从第几条开始 0,10,20
      const skip = (page - 1) * pageSize

      const [notes, total] = await Promise.all([
        prisma.note.findMany({
          where: { userId: user.id },
          skip: skip,
          take: pageSize, // 要多少条
          orderBy: { createdAt: "desc" }, // 最新的排在最前面
        }),
        prisma.note.count({ where: { userId: user.id } }),
      ])

      // 第几页
      // const total = Math.ceil(total / pageSize)

      return c.json({
        code: 200,
        message: "success",
        data: {
          list: notes,
          total,
        },
      })
    } catch (error) {
      console.log(error)
      throw new HTTPException(500, { message: "Internal server error" })
    }
  })
  .get("/:id", zValidator("param", noteIdSchema), getAuthUser, async c => {
    try {
      const user = c.get("user")
      const { id } = c.req.valid("param")
      const note = await prisma.note.findFirst({
        where: { id, userId: user.id },
      })

      if (!note) {
        throw new HTTPException(404, { message: "Note not found" })
      }

      return c.json({ code: 200, message: "success", data: note })
    } catch (error) {
      if (error instanceof HTTPException) {
        throw error
      }
      throw new HTTPException(500, { message: "Internal server error" })
    }
  })
