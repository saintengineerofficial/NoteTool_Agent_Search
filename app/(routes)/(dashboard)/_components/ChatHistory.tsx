import { Button } from '@/components/ui/button'
import { XIcon } from 'lucide-react'
import React from 'react'
import { useChat } from '../chat/_lib/useChat'
import { cn } from '@/lib/utils'
import { RiChatAiLine, RiLoader5Fill } from '@remixicon/react'
import { format } from "date-fns";
import { useRouter } from 'next/navigation'
import { useSidebar } from '@/components/ui/sidebar'
import { useLocalChat } from '@/store/useLocalChat'

const ChatHistory = () => {
  const router = useRouter()
  const { open } = useSidebar()
  const { isHistoryOpen, onToggleHistory } = useLocalChat();
  const { data: chatList, isPending } = useChat()

  const handleChatClick = (id: string) => {
    onToggleHistory()
    router.push(`/chat/${id}`)
  }

  return (
    <div className={cn('fixed top-0 left-0 h-full w-80 bg-white dark:bg-background border-r border-border z-9 transform transition-transform duration-500 ease-in-out', open && isHistoryOpen ? "lg:left-64" : "left-0", isHistoryOpen ? "translate-x-0" : "-translate-x-full")}>
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-border">
        <h2 className="text-base font-semibold">Chat History</h2>
        <Button size="icon" variant="ghost" className="h-4" onClick={onToggleHistory}>
          <XIcon className="w-6 h-6" />
        </Button>
      </div>
      <div className="w-full flex-1 flex justify-center min-h-40 max-h-[calc(100%-48px)] overflow-y-auto pb-5">
        {isPending ? (<RiLoader5Fill className="w-10 h-10 animate-spin text-primary" />)
          : chatList?.length === 0 ? (<div>No Chat</div>)
            : (
              <ul className="w-full space-y-2.5 px-2 py-3">
                {chatList?.map((chat) => (
                  <li key={chat.id}>
                    <div
                      className="w-full px-1 py-1.5 flex items-center gap-2 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                      onClick={() => handleChatClick(chat.id)}
                    >
                      <RiChatAiLine className="w-4 h-4 mt-1.5 text-muted-foreground" />
                      <div className="w-full text-left">
                        <h3 className="text-sm dark:text-white/80 font-semibold truncate text-ellipsis whitespace-nowrap max-w-[270px] mb-1">
                          {chat.title}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(chat.createdAt), "MMM d, yyyy")}
                        </p>
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