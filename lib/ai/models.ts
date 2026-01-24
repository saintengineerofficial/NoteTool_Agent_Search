export interface ChatModel {
  id: string
  name: string
  description: string
}

export const chatModels: ChatModel[] = [
  {
    id: "deepseek/deepseek-v3.2",
    name: "Deepseek",
    description:
      "Deepseek is a large language model trained by Deepseek AI. It is designed to be a general-purpose conversational AI model, capable of engaging in a wide range of topics and tasks.",
  },
  {
    id: "anthropic/claude-sonnet-4",
    name: "Claude Sonnet 4",
    description: "Anthropic's flagship model for advanced conversations",
  },
  {
    id: "xai/grok-4", // Updated to actual available model
    name: "Grok 4",
    description: "xAI's most intelligent model with tool use and real-time search",
  },
  {
    id: "openai/gpt-4.1",
    name: "GPT-4 Chat",
    description: "Latest OpenAI GPT-4 optimized for dialogue and reasoning",
  },
  {
    id: "google/gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    description: "Google's fast experimental multimodal reasoning model",
  },
] as const

export const DEFAULT_MODEL_ID = chatModels[0].id
// export const DEVELOPMENT_CHAT_MODEL = "models/gemini-2.5-flash"
export const DEVELOPMENT_CHAT_MODEL = "deepseek-chat"

export const MODEL_OPTIONS = chatModels.map(m => ({
  value: m.id,
  label: m.name,
}))
