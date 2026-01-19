import {
  PromptInput, PromptInputBody, PromptInputButton, PromptInputFooter, PromptInputTextarea, PromptInputTools,
  PromptInputSelect, PromptInputSelectContent, PromptInputSelectItem, PromptInputSelectTrigger, PromptInputSelectValue,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input"
import { cn } from "@/lib/utils"
import { UIMessage, UseChatHelpers } from "@ai-sdk/react"
import { ChatStatus } from "ai"
import { ArrowUpIcon, LucideSettings2, XIcon } from "lucide-react"
import React, { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useLocalChat } from "@/store/useLocalChat"
import { MODEL_OPTIONS } from "@/lib/ai/models"
import { AVAILABLE_TOOLS, type AvailableToolType } from "@/lib/ai/tools/constant"
import { RiSquareFill } from "@remixicon/react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import useViewState from "@/hooks/useViewState"

type Props = {
  chatId: string
  input: string
  status: ChatStatus
  messages: Array<UIMessage>
  initialModelId: string
  disabled?: boolean
  className?: string
  setInput: (val: string) => void
  sendMessage: UseChatHelpers<UIMessage>["sendMessage"]
  stop: () => void
}

const ChatInput = (props: Props) => {
  const { chatId, input, initialModelId, status, className, setInput, sendMessage, disabled, stop } = props

  const [toolsOpen, setToolsOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState<AvailableToolType | null>()
  const { setIsChatView } = useViewState()
  const { localModelId, setLocalModelId } = useLocalChat();


  const isGenerating = status === "streaming" || status === "submitted"
  const selectedModelId = localModelId || initialModelId

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setInput(newValue);
  };
  const handleSelectTool = (tool: AvailableToolType) => {
    setSelectedTool(tool);
    setToolsOpen(false);
  };

  const handleStop = () => {
    stop();
    toast.info("Generation stopped!!");
  };

  const onSubmit = () => {
    if (disabled) return;

    if (!input.trim()) {
      toast.error("Please type in a message");
      return;
    }

    if (!chatId) {
      toast.error("Please reload chatId not found");
      return;
    }

    if (status === "streaming") {
      toast.error("Please wait for the current response to finish or stop it first!");
      return;
    }

    // replaceState只是修改当前页面的URL，不会刷新页面
    window.history.replaceState({}, "", `/chat/${chatId}`);
    setIsChatView(true);

    sendMessage(
      { role: 'user', parts: [{ type: 'text', text: input }] },
      { body: { selectedModelId, selectedToolName: selectedTool?.name || null } }
    )
    setInput("");
  }

  return (
    <PromptInput className={cn(`rounded-3xl`, className)} onSubmit={onSubmit}>
      <div className="relative w-full">
        {selectedTool && (
          <div className="flex items-center gap-1 pt-1.5 pl-2">
            <div className="bg-primary/10 text-primary inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium">
              <selectedTool.icon size={12} />
              <span>{selectedTool.name}</span>
              <button className="hover:bg-primary/20 ml-1 rounded-sm p-0.5 transition-colors" onClick={() => setSelectedTool(null)}>
                <XIcon size={10} />
              </button>
            </div>
          </div>
        )}
        <PromptInputBody>
          <PromptInputTextarea
            placeholder="Ask, search or create note..."
            rows={2}
            autoFocus
            value={input}
            className="text-sm w-full"
            onChange={handleInput}
          />
        </PromptInputBody>
      </div>

      <PromptInputFooter>
        <PromptInputTools>
          <PromptInputSelect value={selectedModelId} onValueChange={setLocalModelId}>
            <PromptInputSelectTrigger className="border bg-white dark:bg-inherit">
              <PromptInputSelectValue />
            </PromptInputSelectTrigger>
            <PromptInputSelectContent>
              {MODEL_OPTIONS.map(model => (
                <PromptInputSelectItem key={model.value} value={model.value}>
                  {model.label}
                </PromptInputSelectItem>
              ))}
            </PromptInputSelectContent>
          </PromptInputSelect>

          <Popover open={toolsOpen} onOpenChange={setToolsOpen}>
            <PopoverTrigger asChild>
              <PromptInputButton className="text-muted-foreground" size="sm" variant="outline">
                <LucideSettings2 size={16} />
                Tools
              </PromptInputButton>
            </PopoverTrigger>
            <PopoverContent
              className="w-48 px-1.5 py-2 drop-shadow-sm"
              align="start"
            >
              <ul className="space-y-px">
                {AVAILABLE_TOOLS?.map((tool) => {
                  const Icon = tool.icon;
                  return (
                    <li key={tool.type}>
                      <button
                        className="w-full flex items-center gap-1 p-2 rounded-md hover:bg-accent text-left text-sm transition-colors "
                        onClick={() => handleSelectTool(tool)}
                      >
                        <Icon size={14} className="text-muted-foreground" />
                        {tool.name}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </PopoverContent>
          </Popover>
        </PromptInputTools>
        {isGenerating ? (
          <Button size="icon" className="bg-muted! rounded-full dark:bg-black border cursor-pointer" onClick={handleStop}>
            <RiSquareFill size={14} className="text-black dark:text-white" />
          </Button>
        ) : (
          <PromptInputSubmit status={status} disabled={!input.trim() || disabled} className="absolute right-2 rounded-full bottom-1.5 text-white">
            <ArrowUpIcon size={25} />
          </PromptInputSubmit>
        )}
      </PromptInputFooter>
    </PromptInput>
  )
}

export default ChatInput
