import useNoteId from "@/hooks/useNoteId"
import { api } from "@/lib/hono/hono-rpc"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { InferRequestType, InferResponseType } from "hono"
import { toast } from "sonner"

type ReqCreateNoteType = InferRequestType<typeof api.note.create.$post>["json"]
type ResCreateNoteType = InferResponseType<typeof api.note.create.$post>

type ReqUpdateNoteType = InferRequestType<typeof api.note.update.$post>["json"]
type ResUpdateNoteType = InferResponseType<typeof api.note.update.$post>

export const useCreateNote = () => {
  const qc = useQueryClient()
  const { setNoteId } = useNoteId()

  return useMutation<ResCreateNoteType, Error, ReqCreateNoteType>({
    mutationFn: async json => {
      const response = await api.note.create.$post({ json })
      return response.json()
    },
    onSuccess: (response, variables) => {
      const noteId = response.data.id
      setNoteId(noteId) // 创建一个新的会话

      qc.invalidateQueries({
        queryKey: ["notesList"],
        refetchType: "all",
      })
    },
    onError: error => {
      toast.error(error?.message ?? "Failed to create note")
    },
  })
}

export const useUpdateNote = () => {
  const qc = useQueryClient()

  return useMutation<ResUpdateNoteType, Error, ReqUpdateNoteType>({
    mutationFn: async json => {
      const response = await api.note.update.$post({ json })
      return response.json()
    },
    onSuccess: () => {
      toast.success("Saved!")
      qc.invalidateQueries({
        queryKey: ["notesList"],
        refetchType: "all",
      })
    },
    onError: error => {
      toast.error(error?.message ?? "Failed to update note")
    },
  })
}

export const useNotesList = (page: number = 1, pageSize: number = 10) => {
  return useQuery({
    queryKey: ["notesList", page, pageSize],
    queryFn: async () => {
      const response = await api.note.list.$get({ query: { page, pageSize } })
      if (!response.ok) {
        throw new Error("Failed to fetch note")
      }
      return response.json()
    },
    select: data => data.data,
  })
}

export const useNoteDetail = (id: string) => {
  return useQuery({
    queryKey: ["noteDetail", id],
    queryFn: async () => {
      const response = await api.note[":id"].$get({ param: { id } })
      if (!response.ok) {
        throw new Error("Failed to fetch note")
      }
      return response.json()
    },
    select: data => data.data,
    enabled: !!id,
  })
}
