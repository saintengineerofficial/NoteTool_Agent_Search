import { ToolTypeEnum } from "@/lib/ai/tools/constant"
import type { ToolUIPart } from "ai"
import React from "react"
import ToolNoteCard from "./ToolNoteCard"
import SearchExtractPreview from "./SearchExtractPreview"

type ReturnToolRenders = Record<ToolUIPart["type"], (output: any, input: any) => React.ReactNode>

// 元素Map映射
const ToolRenders: ReturnToolRenders = {
  [ToolTypeEnum.CreateNote]: output => {
    const note = output.data?.note ?? output.data ?? null
    return (
      <div className="mt-1 mb-1.5">
        <ToolNoteCard noteId={note?.id} title={note?.title} content={note?.content} />
      </div>
    )
  },
  [ToolTypeEnum.SearchNote]: (output, input) => {
    // console.log("🚀 ~ ToolRenders ~ output, input:", output, input)
    const notes = output.data?.notes ?? output.data ?? []
    return (
      <div className="border-border/40 w-full rounded-lg border px-1.5 py-3">
        <p className="pl-2 text-sm">Searched for {`"${input?.query}"`}</p>
        <ul className="max-h-48 w-full list-none space-y-1 overflow-y-auto pt-2 pb-4 pl-0">
          {Array.isArray(notes) &&
            notes?.map((note: any) => (
              <li key={note.id}>
                <ToolNoteCard noteId={note?.id} title={note?.title} />
              </li>
            ))}
        </ul>
      </div>
    )
  },
  [ToolTypeEnum.WebSearch]: (output, input) => {
    return (
      <div className="mt-1 mb-1.5">
        <SearchExtractPreview type="webSearch" input={input} output={output} />
      </div>
    )
  },
  [ToolTypeEnum.ExtractWebUrl]: (output, input) => {
    return (
      <div className="mt-1 mb-1.5">
        <SearchExtractPreview type="extractWebUrl" input={input} output={output} />
      </div>
    )
  },
}

export default ToolRenders
