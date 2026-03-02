import { useMutation } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"

export interface ExtractedWord {
  word: string
  meaning: string
  example: string
  pronunciation: string
}

export function useExtractWords() {
  return useMutation({
    mutationFn: async (imageBase64: string): Promise<ExtractedWord[]> => {
      const { data, error } = await supabase.functions.invoke("extract-words", {
        body: { image: imageBase64 },
      })
      if (error) throw error
      return data.words ?? []
    },
  })
}
