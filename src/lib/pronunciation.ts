interface PronunciationResult {
  audioUrl: string | null
  phonetic: string | null
  source: "dictionary-api"
}

export async function fetchPronunciation(
  word: string,
): Promise<PronunciationResult> {
  const res = await fetch(
    `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`,
  )
  if (!res.ok) {
    return { audioUrl: null, phonetic: null, source: "dictionary-api" }
  }

  const data = await res.json()
  const entry = data[0]

  let audioUrl: string | null = null
  let phonetic: string | null = entry?.phonetic ?? null

  for (const p of entry?.phonetics ?? []) {
    if (p.audio) {
      audioUrl = p.audio
      if (p.text) phonetic = p.text
      break
    }
  }

  return { audioUrl, phonetic, source: "dictionary-api" }
}

export function playAudioUrl(url: string, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"))
      return
    }

    const audio = new Audio(url)

    const onAbort = () => {
      audio.pause()
      audio.removeAttribute("src")
      reject(new DOMException("Aborted", "AbortError"))
    }
    signal?.addEventListener("abort", onAbort, { once: true })

    audio.addEventListener("ended", () => {
      signal?.removeEventListener("abort", onAbort)
      resolve()
    })
    audio.addEventListener("error", () => {
      signal?.removeEventListener("abort", onAbort)
      reject(new Error("Audio playback failed"))
    })
    audio.play().catch((err) => {
      signal?.removeEventListener("abort", onAbort)
      reject(err)
    })
  })
}

export function speakWord(word: string, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!window.speechSynthesis) {
      reject(new Error("SpeechSynthesis not supported"))
      return
    }

    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"))
      return
    }

    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(word)
    utterance.lang = "en-US"
    utterance.rate = 0.9
    utterance.onend = () => resolve()
    utterance.onerror = (e) => {
      if (e.error === "interrupted" || e.error === "canceled") {
        reject(new DOMException("Aborted", "AbortError"))
      } else {
        reject(new Error(e.error))
      }
    }

    signal?.addEventListener("abort", () => {
      window.speechSynthesis.cancel()
    }, { once: true })

    window.speechSynthesis.speak(utterance)
  })
}
