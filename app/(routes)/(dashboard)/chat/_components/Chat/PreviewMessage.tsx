import type { UIMessage } from 'ai';
import React from 'react'

type Props = {
  message: UIMessage;
  isLoading: boolean;
}

const PreviewMessage = ({ message, isLoading }: Props) => {
  return (
    <div>PreviewMessage</div>
  )
}

export default PreviewMessage