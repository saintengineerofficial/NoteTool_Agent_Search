import { Hono } from "hono"
import { HTTPException } from "hono/http-exception"
import { handle } from "hono/vercel"
import { getAuthUser } from "@/lib/hono/hono-middlware"
import { noteRoute } from "./note"
import { chatRoute } from "./chat"

export const runtime = "nodejs"

const app = new Hono()

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return err.getResponse()
  }
  return c.json({
    error: "internal error",
  })
})

const routes = app.basePath("/api").route("/note", noteRoute).route("/chat", chatRoute)

// 中间价
routes.get("/", getAuthUser, c => {
  return c.json({
    message: "Hello from toto.ai",
  })
})

export type AppType = typeof routes

export const GET = handle(app)
export const POST = handle(app)
export const PATCH = handle(app)
export const PUT = handle(app)
export const DELETE = handle(app)
