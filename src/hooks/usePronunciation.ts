import { useQueryClient } from "@tanstack/react-query"
import { useCallback, useState } from "react"
import {
  fetchPronunciation,
  playAudioUrl,
  speakWord,
} from "@/lib/pronunciation"

export function usePronunciation(word: string) {
  const queryClient = useQueryClient()
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const play = useCallback(async () => {
    if (isPlaying || !word) return

    setIsPlaying(true)
    setError(null)

    try {
      const data = await queryClient.fetchQuery({
        queryKey: ["pronunciation", word],
        queryFn: () => fetchPronunciation(word),
        staleTime: Infinity,
      })

      if (data?.audioUrl) {
        try {
          await playAudioUrl(data.audioUrl)
          return
        } catch {
          // MP3 failed, fall through to TTS
        }
      }

      await speakWord(word)
    } catch {
      setError("발음을 재생할 수 없습니다")
    } finally {
      setIsPlaying(false)
    }
  }, [isPlaying, word, queryClient])

  return {
    play,
    isPlaying,
    error,
  }
}
