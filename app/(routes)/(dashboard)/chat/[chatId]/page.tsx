"use client"
import React from "react"
import ChatHeader from "../../_components/ChatHeader"
import Chat from "../_components/Chat"
import { useParams } from "next/navigation"
import { useChatId } from "../_lib/useChat"

type ParamsType = { chatId: string }

const Page = () => {
  const { chatId } = useParams<ParamsType>()

  const { data: chatData, isLoading } = useChatId(chatId)

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
