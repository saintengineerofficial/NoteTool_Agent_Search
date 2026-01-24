"use client"
import React from "react"
import { RiEmotionHappyFill } from "@remixicon/react"
import { cn } from "@/lib/utils"
import ChatHeader from "../../_components/ChatHeader"
import useViewState from "@/hooks/useViewState"
import RecentNotes from "./RecentNotes"
import Chat from "../../chat/_components/Chat"

type Props = {
  id: string
}

const MainSection = ({ id }: Props) => {
  const { isChatView } = useViewState()
  return (
    <React.Fragment>
      <ChatHeader showActions={isChatView} />
      <div className="relative w-full">
        <div className={cn("w-full", !isChatView && "mx-auto max-w-2xl space-y-5 px-4 md:px-0")}>
          {!isChatView && (
            <div className="mt-16 flex w-full items-center justify-center">
              <h1 className="fade-in-up z-0 flex items-center gap-2 text-center text-[24px] font-semibold tracking-tighter text-pretty text-gray-800 opacity-0 [animation-delay:200ms] sm:text-[30px] md:text-[35px] dark:text-white">
                <RiEmotionHappyFill className="size-6! md:size-10! lg:mt-2" />
                How can I help you today?
              </h1>
            </div>
          )}
          <Chat chatId={id} initialMessages={[]} initialLoading={false} onlyInput={!isChatView} />

          {!isChatView && (
            <div className="w-full pt-7">
              <div className="w-full">
                <span className="text-sm dark:text-white/50">Recent notes</span>
              </div>
              <RecentNotes />
            </div>
          )}
        </div>
      </div>
    </React.Fragment>
  )
}

export default MainSection
