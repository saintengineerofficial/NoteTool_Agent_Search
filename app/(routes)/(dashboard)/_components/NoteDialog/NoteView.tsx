import { useNoteDetail, useUpdateNote } from "@/app/(routes)/(dashboard)/_lib/useNote"
import { AutosizeTextarea, type AutosizeTextAreaRef } from "@/components/ui/autosize-textarea"
import { Button } from "@/components/ui/button"
import { SheetClose, SheetFooter } from "@/components/ui/sheet"
import { RiLoader5Fill, RiEditLine, RiEyeLine } from "@remixicon/react"
import React, { useEffect, useRef, useState } from "react"
import MarkdownPreview from "@uiw/react-markdown-preview"

type Props = {
  noteId: string
}

const NoteView = ({ noteId }: Props) => {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [isPreviewMode, setIsPreviewMode] = useState(true)

  const titleTextRef = useRef<AutosizeTextAreaRef | null>(null)
  const contentTextRef = useRef<AutosizeTextAreaRef | null>(null)

  const { data: note, isLoading } = useNoteDetail(noteId)
  const { mutate, isPending } = useUpdateNote()

  const handleSave = () => {
    if (!noteId) return
    mutate({ id: noteId, title, content })
  }

  useEffect(() => {
    if (note) {
      setTitle(note.title)
      setContent(note.content)
    }
  }, [note])

  useEffect(() => {
    if (!isLoading) {
      const titleTextAreaEle = titleTextRef.current
      if (titleTextAreaEle) {
        titleTextAreaEle.textArea.style.minHeight = "auto !important"
        titleTextAreaEle.textArea.style.maxHeight = "auto !important"
        titleTextAreaEle.textArea.focus()
      }
    }
  }, [isLoading])

  if (isLoading) {
    return (
      <div className="flex h-[20vh] w-full items-center justify-center">
        <RiLoader5Fill className="text-primary h-16 w-16 animate-spin" />
      </div>
    )
  }

  return (
    <div className="relative h-full w-full p-6">
      <div className="mb-3 w-full pl-2">
        <div className="mb-4 border-b pb-2">
          <AutosizeTextarea
            ref={titleTextRef}
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Untitled note..."
            className="placeholder:text-muted-foreground/40 w-full resize-none overflow-hidden border-none! bg-transparent px-0! text-4xl leading-tight font-bold outline-none focus-visible:ring-0! focus-visible:ring-offset-0!"
          />

          {/* Toggle buttons */}
          <div className="mt-3 flex gap-2">
            <Button variant={!isPreviewMode ? "default" : "outline"} size="sm" onClick={() => setIsPreviewMode(false)} className="gap-2">
              <RiEditLine className="h-4 w-4" />
              Edit
            </Button>
            <Button variant={isPreviewMode ? "default" : "outline"} size="sm" onClick={() => setIsPreviewMode(true)} className="gap-2">
              <RiEyeLine className="h-4 w-4" />
              Preview
            </Button>
          </div>
        </div>

        {/* Content area - Edit or Preview */}
        <div className="w-full pl-2">
          {!isPreviewMode ? (
            <AutosizeTextarea
              ref={contentTextRef}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Write your note in Markdown... Supports Mermaid diagrams!"
              className="placeholder:text-muted-foreground/40 min-h-[55vh]! w-full resize-none overflow-hidden border-none! bg-transparent px-0 leading-tight outline-none focus-visible:ring-0! focus-visible:ring-offset-0!"
            />
          ) : (
            <div className="prose prose-slate dark:prose-invert min-h-[55vh] max-w-none">
              <MarkdownPreview
                source={content || "*No content yet...*"}
                style={{
                  backgroundColor: "transparent",
                  color: "inherit",
                  padding: 0,
                }}
              />
            </div>
          )}
        </div>

        <SheetFooter className="sticky bottom-0">
          <div className="flex items-center">
            <Button
              disabled={isPending || !noteId || !content}
              className="ml-auto cursor-pointer rounded-full px-10! text-lg! disabled:opacity-75"
              size="lg"
              onClick={handleSave}>
              {isPending && <RiLoader5Fill className="h-7! w-7! animate-spin" />}
              Save Changes
            </Button>
            {/* <SheetClose asChild>
              <Button variant="outline">Close</Button>
            </SheetClose> */}
          </div>
        </SheetFooter>
      </div>
    </div>
  )
}

export default NoteView
