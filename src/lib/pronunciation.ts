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

export function playAudioUrl(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const audio = new Audio(url)
    audio.addEventListener("ended", () => resolve())
    audio.addEventListener("error", () => reject(new Error("Audio playback failed")))
    audio.play().catch(reject)
  })
}

export function speakWord(word: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!window.speechSynthesis) {
      reject(new Error("SpeechSynthesis not supported"))
      return
    }

    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(word)
    utterance.lang = "en-US"
    utterance.rate = 0.9
    utterance.onend = () => resolve()
    utterance.onerror = (e) => reject(new Error(e.error))

    window.speechSynthesis.speak(utterance)
  })
}
