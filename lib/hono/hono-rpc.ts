import { hc } from "hono/client"
import { AppType } from "@/app/api/[[...route]]/route"

const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    return window.location.origin
  }
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }
  // Fallback for local/dev if env is missing
  return "http://localhost:3000"
}

export const client = hc<AppType>(getBaseUrl())

export const api = client.api
