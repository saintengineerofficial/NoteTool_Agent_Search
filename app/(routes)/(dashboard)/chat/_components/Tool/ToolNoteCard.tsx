import useNoteId from "@/hooks/useNoteId"
import { RiFileTextLine } from "@remixicon/react"
import React from "react"

type Props = {
  noteId: string
  title: string
  content?: string
}

const ToolNoteCard = React.memo(({ noteId, title, content }: Props) => {
  const { setNoteId } = useNoteId()

  if (!content) {
    return (
      <button
        className="item-center hover:bg-accent flex w-full gap-2 rounded-sm py-1 text-left text-sm dark:text-white/80"
        onClick={() => setNoteId(noteId)}>
        <RiFileTextLine className="h-5 w-5" />
        <span>{title}</span>
      </button>
    )
  }

  return (
    <div
      role="button"
      className="bg-muted border-border flex cursor-pointer flex-col gap-2 rounded-md border p-4 shadow-sm transition-all hover:shadow-md"
      onClick={() => setNoteId(noteId)}>
      <h4 className="line-clamp-1 text-xl font-semibold">{title}</h4>
      <p className="text-muted-foreground line-clamp-3 text-sm">{content}</p>
    </div>
  )
})

ToolNoteCard.displayName = "ToolNoteCard"

export default ToolNoteCard
