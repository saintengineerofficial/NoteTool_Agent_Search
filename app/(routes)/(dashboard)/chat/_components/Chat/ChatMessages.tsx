import { ChatStatus, UIMessage } from "ai"
import React, { useEffect, useRef } from "react"
import { Conversation, ConversationContent } from "@/components/ai-elements/conversation"
import { RiCircleFill } from "@remixicon/react"
import { useStickToBottom } from "use-stick-to-bottom"
import PreviewMessage from "./ChatMessage"
import LoadingMessages from "./LoadingMessages"
import Greeting from "./Greeting"
import ChatErrorAlert from "./ChatErrorAlert"

interface Props {
  chatId?: string
  messages: UIMessage[]
  error?: Error
  status: ChatStatus
  isLoading: boolean
}

const ChatMessages = ({ messages = [], status, isLoading, error }: Props) => {
  const { scrollRef, contentRef, scrollToBottom } = useStickToBottom()
  const lastMsgIdRef = useRef<string | undefined>(undefined)

  // useEffect(() => {
  //   if (messages || status === "submitted" || status === "ready") {
  //     scrollToBottom() // 保持在底部
  //   }
  // }, [messages, status, scrollToBottom])

  useEffect(() => {
    const lastId = messages[messages.length - 1]?.id
    const hasNewMessage = lastId && lastId !== lastMsgIdRef.current

    // 只在“新增消息”时尝试滚动，且仅在用户本来就在底部时滚
    if (hasNewMessage) {
      scrollToBottom({ preserveScrollPosition: true })
      lastMsgIdRef.current = lastId
    }
  }, [messages.length, scrollToBottom])

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto">
      <Conversation className="h-auto min-h-[calc(100vh-157px)]">
        <ConversationContent className="mx-auto flex h-auto w-full flex-col gap-5 pt-15 pb-30 md:max-w-3xl lg:px-0">
          <div ref={contentRef}>
            {isLoading && <LoadingMessages />}

            {!isLoading && messages.length === 0 && <Greeting />}

            {messages?.map((message, index) => (
              <PreviewMessage key={message.id} message={message} isLoading={status === "streaming" && messages.length - 1 === index} />
            ))}

            {status === "submitted" && messages.length > 0 && messages[messages.length - 1]?.role === "user" && (
              <span>
                <RiCircleFill className="h-4 w-4 animate-bounce rounded-full dark:text-white" />
              </span>
            )}

            {status === "streaming" && messages.length > 0 && messages[messages.length - 1]?.role === "assistant" && (
              <span>
                <RiCircleFill className="h-4 w-4 animate-bounce rounded-full dark:text-white" />
              </span>
            )}

            {status === "error" && error && <ChatErrorAlert title="Chat Error" message={error.message ?? "Something went wrong"} />}
          </div>
        </ConversationContent>
      </Conversation>
    </div>
  )
}

export default ChatMessages
