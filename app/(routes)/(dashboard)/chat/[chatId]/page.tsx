"use client"
import React from "react"
import ChatHeader from "../../_components/ChatHeader"
import Chat from "../_components/Chat"
import { useParams, useRouter } from "next/navigation"
import { useChatId } from "../_lib/useChat"
import { toast } from "sonner"

type ParamsType = { chatId: string }

const Page = () => {
  const router = useRouter()
  const { chatId } = useParams<ParamsType>()

  const { data: chatRes, isLoading } = useChatId(chatId)

  if (!chatRes?.data) {
    toast(chatRes?.message)
    router.replace("/home")
  }

  const chatData = chatRes?.data

  return (
    <React.Fragment>
      <ChatHeader title={chatData?.chat?.title || "Untitled"} showActions />
      <div className="relative w-full">
        <Chat chatId={chatId} initialMessages={chatData?.messages ?? []} initialLoading={isLoading} onlyInput={false} />
      </div>
    </React.Fragment>
  )
}

export default Page
