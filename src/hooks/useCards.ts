import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import type { InsertDto, UpdateDto } from "@/types/database.types"

export function useCardsByDeck(deckId: string) {
  return useQuery({
    queryKey: ["cards", deckId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cards")
        .select("*, card_states(status)")
        .eq("deck_id", deckId)
        .order("created_at", { ascending: false })
      if (error) throw error
      return data
    },
  })
}

export function useCard(cardId: string | undefined) {
  return useQuery({
    queryKey: ["cards", "detail", cardId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cards")
        .select("*")
        .eq("id", cardId!)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!cardId,
  })
}

export function useCreateCard() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (card: InsertDto<"cards">) => {
      const { data, error } = await supabase
        .from("cards")
        .insert(card)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (_data, card) => {
      qc.invalidateQueries({ queryKey: ["cards", card.deck_id] })
      qc.invalidateQueries({ queryKey: ["deck-progress"] })
    },
  })
}

export function useUpdateCard() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      deckId,
      ...updates
    }: UpdateDto<"cards"> & { id: string; deckId: string }) => {
      const { error } = await supabase
        .from("cards")
        .update(updates)
        .eq("id", id)
      if (error) throw error
    },
    onSuccess: (_data, { deckId }) => {
      qc.invalidateQueries({ queryKey: ["cards", deckId] })
      qc.invalidateQueries({ queryKey: ["cards", "detail"] })
    },
  })
}

export function useDeleteCard() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id }: { id: string; deckId: string }) => {
      const { error } = await supabase.from("cards").delete().eq("id", id)
      if (error) throw error
    },
    onSuccess: (_data, { deckId }) => {
      qc.invalidateQueries({ queryKey: ["cards", deckId] })
      qc.invalidateQueries({ queryKey: ["deck-progress"] })
    },
  })
}
