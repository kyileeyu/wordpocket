import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { useAuthStore } from "@/stores/authStore"

async function fetchFolders() {
  const { data, error } = await supabase
    .from("folders")
    .select("*")
    .order("sort_order")
  if (error) throw error
  return data
}

export function useFolders() {
  return useQuery({ queryKey: ["folders"], queryFn: fetchFolders })
}

export function useCreateFolder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (name: string) => {
      const { error } = await supabase.from("folders").insert({
        user_id: useAuthStore.getState().user!.id,
        name,
      })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["folders"] }),
  })
}

export function useUpdateFolder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const { error } = await supabase
        .from("folders")
        .update({ name })
        .eq("id", id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["folders"] }),
  })
}

export function useDeleteFolder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("folders").delete().eq("id", id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["folders"] })
      qc.invalidateQueries({ queryKey: ["deck-progress"] })
    },
  })
}
