import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { useAuthStore } from "@/stores/authStore"

export function useDecksByFolder(folderId: string) {
  return useQuery({
    queryKey: ["decks", folderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("decks")
        .select("*")
        .eq("folder_id", folderId)
        .order("sort_order")
      if (error) throw error
      return data
    },
  })
}

export function useDeckProgress() {
  return useQuery({
    queryKey: ["deck-progress"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_deck_progress")
      if (error) throw error
      return data
    },
  })
}

export function useDeck(id: string) {
  return useQuery({
    queryKey: ["decks", "detail", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("decks")
        .select("*")
        .eq("id", id)
        .single()
      if (error) throw error
      return data
    },
  })
}

export function useCreateDeck() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      folderId,
      name,
    }: {
      folderId: string
      name: string
    }) => {
      const { error } = await supabase.from("decks").insert({
        user_id: useAuthStore.getState().user!.id,
        folder_id: folderId,
        name,
      })
      if (error) throw error
    },
    onSuccess: (_data, { folderId }) => {
      qc.invalidateQueries({ queryKey: ["decks", folderId] })
      qc.invalidateQueries({ queryKey: ["deck-progress"] })
    },
  })
}

export function useUpdateDeck() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { error } = await supabase
        .from("decks")
        .update({ name })
        .eq("id", id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["decks"] })
      qc.invalidateQueries({ queryKey: ["deck-progress"] })
    },
  })
}

export function useDeleteDeck() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("decks").delete().eq("id", id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["decks"] })
      qc.invalidateQueries({ queryKey: ["deck-progress"] })
    },
  })
}
