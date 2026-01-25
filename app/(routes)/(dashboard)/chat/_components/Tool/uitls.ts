import type { ToolUIPart } from "ai"
import type { LucideIcon } from "lucide-react"
import { AlertCircleIcon, CircleSlash, FileText, GlobeIcon, Lightbulb, SearchIcon } from "lucide-react"

type Status = { text: string; icon: LucideIcon }

export function getToolStatus(toolName: string, state: ToolUIPart["state"], output?: any): Status {
  const notes = Array.isArray(output?.data?.notes)
    ? output.data.notes
    : Array.isArray(output?.notes)
      ? output.notes
      : []
  const count = notes.length

  switch (state) {
    case "input-streaming":
      return { text: "Preparing request...", icon: Lightbulb }

    case "input-available":
      switch (toolName) {
        case "createNote":
          return { text: "Creating note...", icon: FileText }
        case "searchNote":
          return { text: "Searching note...", icon: SearchIcon }
        case "webSearch":
          return { text: "Searching web...", icon: GlobeIcon }
        case "extractWebUrl":
          return { text: "Extracting content...", icon: GlobeIcon }
        default:
          return { text: "Working...", icon: Lightbulb }
      }

    case "output-available":
      switch (toolName) {
        case "createNote":
          return { text: "Note created", icon: FileText }
        case "searchNote":
          return {
            text: count > 0 ? `${count} notes found` : "No notes found",
            icon: SearchIcon,
          }
        case "webSearch":
          return { text: "Web search results", icon: GlobeIcon }
        case "extractWebUrl":
          return { text: "Content extracted", icon: GlobeIcon }
        default:
          return { text: "Done", icon: Lightbulb }
      }

    case "output-error":
      return { text: "Error occurred", icon: AlertCircleIcon }

    default:
      return { text: "Unknown", icon: CircleSlash }
  }
}
