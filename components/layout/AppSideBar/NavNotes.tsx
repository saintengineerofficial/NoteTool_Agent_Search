import React from "react"
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { RiAddLine, RiFileTextLine, RiLoader5Fill } from "@remixicon/react"
import LoaderOverlay from "@/components/global/LoaderOverlay"
import { useCreateNote, useNotesList } from "@/app/(routes)/(dashboard)/_lib/useNote"
import useNoteId from "@/hooks/useNoteId"

const NavNotes = () => {
  const { noteId, setNoteId } = useNoteId()
  const { data: notesData, isPending } = useNotesList()
  const { mutate, isPending: isLoading } = useCreateNote()

  const handleAddNote = () => {
    mutate({ title: "Untitled", content: "" })
  }

  return (
    <React.Fragment>
      <LoaderOverlay text="Creating note..." isLoading={isLoading} />
      <SidebarGroup>
        <SidebarGroupLabel>
          <h5>Notes</h5>
          <SidebarGroupAction
            className="bg-primary/20 mt-[1.5px] flex size-5.5 cursor-pointer items-center rounded-md border"
            onClick={handleAddNote}>
            <RiAddLine className="size-5!" />
            <span className="sr-only">Add Notes</span>
          </SidebarGroupAction>
        </SidebarGroupLabel>
        <SidebarGroupContent className="h-auto max-h-[360px] min-h-32 w-full overflow-y-auto">
          <SidebarMenu>
            {notesData?.list?.length === 0 ? (
              <div>No Notes</div>
            ) : isPending ? (
              <div className="flex items-center justify-center">
                <RiLoader5Fill className="text-primary h-8 w-8 animate-spin" />
              </div>
            ) : (
              notesData?.list?.map(note => {
                const isActive = note.id === noteId
                return (
                  <SidebarMenuItem key={note.id}>
                    <SidebarMenuButton className="flex w-full items-center" isActive={isActive} onClick={() => setNoteId(note.id)}>
                      <span className="bg-secondary flex h-8 w-8 items-center justify-center rounded-lg">
                        <RiFileTextLine className="text-primary h-4 w-4" />
                      </span>
                      <h5 className="flex-1 truncate">{note.title}</h5>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })
            )}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </React.Fragment>
  )
}

export default NavNotes
