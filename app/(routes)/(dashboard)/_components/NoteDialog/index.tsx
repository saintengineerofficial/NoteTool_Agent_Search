"use client"
import React from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import useNoteId from "@/hooks/useNoteId"
import NoteView from "./NoteView"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

const NotDialog = () => {
  const { noteId, clearNoteId } = useNoteId()

  return (
    <Sheet open={!!noteId} onOpenChange={() => clearNoteId()}>
      <SheetContent side="right" className="border-l p-0 sm:max-w-[50vw] lg:w-1/2">
        <VisuallyHidden>
          <SheetHeader className="bg-muted border-b px-4 py-2">
            <SheetTitle> </SheetTitle>
          </SheetHeader>
        </VisuallyHidden>
        <div className="max-h-screen min-h-20 flex-1 overflow-y-auto">{noteId && <NoteView noteId={noteId} />}</div>
      </SheetContent>
    </Sheet>
  )
}

export default NotDialog
