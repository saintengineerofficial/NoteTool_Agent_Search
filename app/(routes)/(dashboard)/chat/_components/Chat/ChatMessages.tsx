import { ChatStatus, UIMessage } from "ai"
import React, { useEffect, useRef } from "react"
import { Conversation, ConversationContent } from "@/components/ai-elements/conversation"
import { useStickToBottom } from "use-stick-to-bottom"
import PreviewMessage from "./ChatMessage"
import LoadingMessages from "./LoadingMessages"
import Greeting from "./Greeting"
import ChatErrorAlert from "./ChatErrorAlert"
import { AnimatePresence, motion } from "motion/react"

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

  useEffect(() => {
    const lastId = messages[messages.length - 1]?.id
    const hasNewMessage = lastId && lastId !== lastMsgIdRef.current
    if (hasNewMessage) {
      scrollToBottom({ preserveScrollPosition: true })
      lastMsgIdRef.current = lastId
    }
  }, [messages.length, scrollToBottom])

  const showGreeting = !isLoading && messages.length === 0
  const showThinking =
    status === "submitted" &&
    messages.length > 0 &&
    messages[messages.length - 1]?.role === "user"

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto">
      <Conversation className="h-auto min-h-[calc(100vh-157px)]">
        <ConversationContent className="mx-auto flex h-auto w-full flex-col gap-5 pt-15 pb-30 md:max-w-3xl lg:px-0">
          <div ref={contentRef}>
            {/* loading */}
            <AnimatePresence initial={false}>
              {isLoading && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  <LoadingMessages />
                </motion.div>
              )}
            </AnimatePresence>

            {/* greeting */}
            <AnimatePresence initial={false}>
              {showGreeting && (
                <motion.div
                  key="greeting"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                >
                  <Greeting />
                </motion.div>
              )}
            </AnimatePresence>

            {/* messages list */}
            <AnimatePresence initial={false}>
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                >
                  <PreviewMessage
                    key={message.id}
                    message={message}
                    isLoading={status === "streaming" && messages.length - 1 === index}
                  />
                </motion.div>
              ))}
            </AnimatePresence>

            {/* submitted -> thinking indicator */}
            <AnimatePresence initial={false}>
              {showThinking && (
                <motion.div
                  key="thinking"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                >
                  {/* 呼吸效果，让“正在生成”更像市面 AI */}
                  <motion.div
                    animate={{ opacity: [0.55, 1, 0.55] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <LoadingMessages isDot />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* error */}
            <AnimatePresence initial={false}>
              {status === "error" && error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                >
                  <ChatErrorAlert title="Chat Error" message={error.message ?? "Something went wrong"} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </ConversationContent>
      </Conversation>
    </div>
  )
}

export default ChatMessages
