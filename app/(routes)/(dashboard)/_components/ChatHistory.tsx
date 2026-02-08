import { Button } from "@/components/ui/button"
import { XIcon } from "lucide-react"
import React from "react"
import { useChat } from "../chat/_lib/useChat"
import { cn } from "@/lib/utils"
import { RiChatAiLine, RiLoader5Fill } from "@remixicon/react"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import { useSidebar } from "@/components/ui/sidebar"
import { useLocalChat } from "@/store/useLocalChat"

const ChatHistory = () => {
  const router = useRouter()
  const { open } = useSidebar()
  const { isHistoryOpen, onToggleHistory } = useLocalChat()
  const { data: chatList, isPending } = useChat()

  const handleChatClick = (id: string) => {
    onToggleHistory()
    router.push(`/chat/${id}`)
  }

  return (
    <div
      className={cn(
        "dark:bg-background border-border fixed top-0 left-0 z-9 h-full w-80 transform border-r bg-white transition-transform duration-500 ease-in-out",
        open && isHistoryOpen ? "lg:left-64" : "left-0",
        isHistoryOpen ? "translate-x-0" : "-translate-x-full"
      )}>
      <div className="border-border flex items-center justify-between border-b px-3 py-2.5">
        <h2 className="text-base font-semibold">Chat History</h2>
        <Button size="icon" variant="ghost" className="h-4" onClick={onToggleHistory}>
          <XIcon className="h-6 w-6" />
        </Button>
      </div>
      <div className="flex max-h-[calc(100%-48px)] min-h-40 w-full flex-1 justify-center overflow-y-auto pb-5">
        {isPending ? (
          <RiLoader5Fill className="text-primary h-10 w-10 animate-spin" />
        ) : chatList?.length === 0 ? (
          <div>No Chat</div>
        ) : (
          <ul className="w-full space-y-2.5 px-2 py-3">
            {chatList?.map(chat => (
              <li key={chat.id}>
                <div
                  className="hover:bg-muted flex w-full cursor-pointer items-center gap-2 rounded-lg px-1 py-1.5 transition-colors"
                  onClick={() => handleChatClick(chat.id)}>
                  <RiChatAiLine className="text-muted-foreground mt-1.5 h-4 w-4" />
                  <div className="w-full text-left">
                    <h3 className="mb-1 max-w-[270px] truncate text-sm font-semibold text-ellipsis whitespace-nowrap dark:text-white/80">
                      {chat.title}
                    </h3>
                    <p className="text-muted-foreground text-xs">{format(new Date(chat.createdAt), "MMM d, yyyy")}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default ChatHistory
