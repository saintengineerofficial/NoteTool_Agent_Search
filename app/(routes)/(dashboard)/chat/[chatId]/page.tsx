"use client"
import React from "react"
import ChatHeader from "../../_components/ChatHeader"
import { generateUUID } from "@/lib/utils"
import Chat from "../_components/Chat"
import { useParams } from "next/navigation"
import { useChatId } from "../_lib/useChat"

type ParamsType = { chatId: string }

const Page = () => {
  const { chatId } = useParams<ParamsType>()

  const { data: chatData } = useChatId(chatId)

  return (
    <React.Fragment>
      <ChatHeader title={chatData?.chat?.title || "Untitled"} showActions />
      <div className="relative w-full">
        <Chat chatId={chatId} initialMessages={chatData?.messages ?? []} initialLoading={false} onlyInput={false} />
      </div>
    </React.Fragment>
  )
}

export default Page
