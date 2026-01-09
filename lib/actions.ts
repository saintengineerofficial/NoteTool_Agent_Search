"use server"

import { generateText, type UIMessage } from "ai"
import { ModelProvider } from "./ai/providers"

export async function generateTitleForUserMessage({ message }: { message: UIMessage }) {
  try {
    const { text } = await generateText({
      model: ModelProvider.languageModel("title-model"),
      system: `\n
        - you will generate a short title based on the first message a user begins a conversation with
        - ensure it is not more than 80 characters long
        - the title should be a summary of the user's message
        - do not use quotes or colons`,
      prompt: JSON.stringify(message),
    })
    return text
  } catch (error) {
    console.log("title ai error", error)
    return "Untitled"
  }
}
