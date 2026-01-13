import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message"
import { Reasoning } from "@/components/ai-elements/reasoning"
import { cn } from "@/lib/utils"
import type { UIMessage } from "ai"
import React from "react"
import { ReasoningContent, ReasoningTrigger } from "../../../../../../components/ai-elements/reasoning"

type Props = {
  message: UIMessage
  isLoading: boolean
}

const PreviewMessage = ({ message, isLoading }: Props) => {
  return (
    <Message key={message.id} from={message.role} className={cn(message.role !== "user" && "max-w-full!")}>
      <MessageContent
        className={cn(
          "text-[15.5px] dark:text-white",
          message.role !== "user"
            ? "m-0! min-h-0! w-full! max-w-full! bg-transparent! px-1! pb-0!"
            : "bg-muted! text-foreground! p-2.5! text-[14.5px]"
        )}>
        {message.parts.map((part, i) => {
          switch (part.type) {
            case "text":
              return <MessageResponse key={`${message.id}-${i}`}>{part.text}</MessageResponse>

            case "reasoning":
              return (
                <Reasoning key={`${message.id}-reason-${i}`}>
                  <ReasoningTrigger />
                  <ReasoningContent>{part.text}</ReasoningContent>
                </Reasoning>
              )

            default:
              return null
          }
        })}
      </MessageContent>
    </Message>
  )
}

export default PreviewMessage
