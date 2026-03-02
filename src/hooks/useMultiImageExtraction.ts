import { useRef, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { normalizeFile, compressImage } from "@/lib/imageProcessing"
import type { ImportImage, CardDraft } from "@/types/photo-import"
import type { ExtractedWord } from "@/hooks/useExtractWords"

interface UseMultiImageExtractionOptions {
  onProgress: (current: number, total: number) => void
  onComplete: (cards: CardDraft[]) => void
  onError: (message: string) => void
}

export function useMultiImageExtraction({
  onProgress,
  onComplete,
  onError,
}: UseMultiImageExtractionOptions) {
  const abortRef = useRef<AbortController | null>(null)

  const startExtraction = useCallback(
    async (images: ImportImage[]) => {
      const controller = new AbortController()
      abortRef.current = controller

      const allCards: CardDraft[] = []
      let successCount = 0
      let failCount = 0

      for (let i = 0; i < images.length; i++) {
        if (controller.signal.aborted) return

        onProgress(i, images.length)

        try {
          // Normalize (HEIC) and compress the image
          const normalized = await normalizeFile(images[i].file)
          const dataUrl = await compressImage(normalized)
          const base64 = dataUrl.split(",")[1]

          if (controller.signal.aborted) return

          // Call the edge function
          const { data, error } = await supabase.functions.invoke("extract-words", {
            body: { image: base64 },
          })

          if (controller.signal.aborted) return

          if (error) {
            failCount++
            continue
          }

          const words: ExtractedWord[] = data.words ?? []
          const cards: CardDraft[] = words.map((w) => ({
            tempId: crypto.randomUUID(),
            word: w.word,
            meaning: w.meaning,
            example: w.example || "",
            pronunciation: w.pronunciation || "",
            synonyms: w.synonyms ?? [],
            sourceImageIndex: i,
            isChecked: true,
            isDuplicate: false,
            isExpanded: false,
          }))

          allCards.push(...cards)
          successCount++
        } catch {
          failCount++
        }
      }

      if (controller.signal.aborted) return

      onProgress(images.length, images.length)

      if (successCount === 0 && failCount > 0) {
        onError("단어 추출에 실패했습니다. 다시 시도해주세요.")
        return
      }

      onComplete(allCards)
    },
    [onProgress, onComplete, onError]
  )

  const cancelExtraction = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
  }, [])

  return { startExtraction, cancelExtraction }
}
