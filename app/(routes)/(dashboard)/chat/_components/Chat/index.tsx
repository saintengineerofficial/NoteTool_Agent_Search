import { UIMessage } from "ai"
import React, { useState } from "react"

type Props = {
  chatId: string
  initialMessages: UIMessage[]
  initialLoading: boolean
  onlyInput: boolean
  inputDisable: boolean
}

const Chat = ({ chatId, initialLoading, initialMessages, onlyInput, inputDisable }: Props) => {
  const [input, setInput] = useState("")

  return <div>Chat</div>
}

export default Chat
