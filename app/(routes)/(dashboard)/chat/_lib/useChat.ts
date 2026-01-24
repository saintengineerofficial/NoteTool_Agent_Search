import { api } from "@/lib/hono/hono-rpc"
import type { APIResponse } from "@/lib/type"
import { useQuery } from "@tanstack/react-query"
import type { UIMessage } from "ai"

type ChatSummary = {
  title: string
  id: string
  createdAt: Date
  updatedAt: Date
  userId: string
}

type ChatDetail = {
  chat: ChatSummary
  messages: UIMessage[]
}

export const useChat = () => {
  return useQuery({
    queryKey: ["chats"],
    queryFn: async () => {
      const response = await api.chat.list.$get()
      if (!response.ok) throw new Error("Failed to fetch chat")
      return response.json()
    },
    select: data => data.data,
  })
}

export const useChatId = (id: string) => {
  return useQuery<APIResponse<ChatDetail>, Error, ChatDetail>({
    queryKey: ["chat", id],
    queryFn: async () => {
      const response = await api.chat[":id"].$get({ param: { id } })
      if (!response.ok) throw new Error("Failed to fetch chat")
      return response.json() as any //?
    },
    enabled: !!id,
    select: data => data.data,
  })
}
