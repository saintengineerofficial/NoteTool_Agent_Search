import { ChatStatus, UIMessage } from "ai";
import React, { FC, useEffect } from "react";
import { Conversation, ConversationContent } from "@/components/ai-elements/conversation";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircleIcon } from "lucide-react";
import { RiCircleFill } from "@remixicon/react";
import { useStickToBottom } from "use-stick-to-bottom";
import PreviewMessage from "./PreviewMessage";
import LoadingMessages from "./LoadingMessages";
import Greeting from "./Greeting";

interface Props {
  chatId?: string;
  messages: UIMessage[];
  error?: Error;
  status: ChatStatus;
  isLoading: boolean;
}

const ChatMessages = ({ messages = [], status, isLoading, error }: Props) => {
  const { scrollRef, contentRef, scrollToBottom } = useStickToBottom();

  useEffect(() => {
    if (messages || status === "submitted" || status === "ready") {
      scrollToBottom(); // 保持在底部
    }
  }, [messages, status, scrollToBottom]);

  return (
    <div ref={scrollRef} className="overflow-y-auto h-auto">
      <Conversation className="h-auto min-h-[calc(100vh-157px)]">
        <ConversationContent className="w-full h-auto pb-30 pt-15 flex flex-col gap-5  lg:px-0 md:max-w-3xl mx-auto">
          {isLoading && <LoadingMessages />}

          {!isLoading && messages.length === 0 && <Greeting />}

          {messages?.map((message, index) => (
            <PreviewMessage
              key={message.id}
              message={message}
              isLoading={status === "streaming" && messages.length - 1 === index}
            />
          ))}

          {status === "submitted" && messages.length > 0 &&
            messages[messages.length - 1]?.role === "user" && (
              <span>
                <RiCircleFill className="w-4 h-4 animate-bounce rounded-full dark:text-white" />
              </span>
            )}

          {status === "streaming" && messages.length > 0 &&
            messages[messages.length - 1]?.role === "assistant" && (
              <span>
                <RiCircleFill className="w-4 h-4 animate-bounce rounded-full dark:text-white" />
              </span>
            )}

          {status === "error" && error && (
            <ErrorAlert title="Chat Error" message={error.message ?? "Something went wrong"} />
          )}
        </ConversationContent>
      </Conversation>
      <div ref={contentRef} />
    </div>
  );
};



function ErrorAlert({ title, message }: { title: string; message: string }) {
  return (
    <>
      <Alert
        variant="destructive"
        className="w-full bg-destructive/20 border-destructive/50"
      >
        <AlertCircleIcon className="h-4 w-4" />
        <div>
          <AlertTitle>{title}</AlertTitle>
          <AlertDescription className="whitespace-break-spaces">
            <p>{message}</p>
          </AlertDescription>
        </div>
      </Alert>
    </>
  );
}
export default ChatMessages;
