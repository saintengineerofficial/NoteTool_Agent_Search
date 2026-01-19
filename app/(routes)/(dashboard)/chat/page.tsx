import React from "react"
import { generateUUID } from "@/lib/utils";
import ChatInterface from "./_components/Chat";
import ChatHeader from "../_components/ChatHeader";

type Props = {}

const Page = (props: Props) => {
  const id = generateUUID();

  return (
    <React.Fragment>
      <ChatHeader showActions />
      <div className="relative w-full">
        <ChatInterface
          key={id}
          chatId={id}
          initialMessages={[]}
          initialLoading={false}
          onlyInput={false}
        />
      </div>
    </React.Fragment>
  )
}

export default Page
