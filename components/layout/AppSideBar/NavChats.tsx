"use client"
import React from "react"
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { RiAddLine, RiFileTextLine, RiLoader5Fill } from "@remixicon/react"
import LoaderOverlay from "@/components/global/LoaderOverlay"
import { useChat } from "@/app/(routes)/(dashboard)/chat/_lib/useChat"
import { useRouter } from "next/navigation"

const NavChats = () => {
  const router = useRouter()
  const { isLoading, data: chatsList, isPending } = useChat()

  const handleAddChat = () => {
    router.push("/chat")
  }

  const handleChatClick = (id: string) => {
    router.push(`/chat/${id}`)
  }

  return (
    <React.Fragment>
      <LoaderOverlay text="Creating Chat..." isLoading={isLoading} />
      <SidebarGroup>
        <SidebarGroupLabel>
          <h5>Chats</h5>
          <SidebarGroupAction
            className="bg-primary/20 mt-[1.5px] flex size-5.5 cursor-pointer items-center rounded-md border"
            onClick={handleAddChat}>
            <RiAddLine className="size-5!" />
            <span className="sr-only">Add Chat</span>
          </SidebarGroupAction>
        </SidebarGroupLabel>
        <SidebarGroupContent className="h-auto max-h-[360px] min-h-32 w-full overflow-y-auto">
          <SidebarMenu>
            {chatsList?.length === 0 ? (
              <div>No Chats</div>
            ) : isPending ? (
              <div className="flex items-center justify-center">
                <RiLoader5Fill className="text-primary h-8 w-8 animate-spin" />
              </div>
            ) : (
              chatsList?.map(Chat => {
                // const isActive = Chat.id === ChatId
                return (
                  <SidebarMenuItem key={Chat.id} onClick={() => handleChatClick(Chat.id)}>
                    <SidebarMenuButton className="flex w-full items-center">
                      <span className="bg-secondary flex h-8 w-8 items-center justify-center rounded-lg">
                        <RiFileTextLine className="text-primary h-4 w-4" />
                      </span>
                      <h5 className="flex-1 truncate">{Chat.title}</h5>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })
            )}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </React.Fragment>
  )
}

export default NavChats
