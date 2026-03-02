import { Volume2, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePronunciation } from "@/hooks/usePronunciation"

interface PronunciationButtonProps {
  word: string
  size?: "sm" | "md"
}

export default function PronunciationButton({
  word,
  size = "md",
}: PronunciationButtonProps) {
  const { play, isPlaying } = usePronunciation(word)

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    play()
  }

  const iconSize = size === "sm" ? 16 : 20

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPlaying}
      className={cn(
        "inline-flex items-center justify-center rounded-full text-text-secondary hover:text-accent transition-colors",
        size === "sm" ? "h-7 w-7" : "h-9 w-9",
        isPlaying && "animate-pulse text-accent",
      )}
      aria-label={`${word} 발음 재생`}
    >
      {isPlaying ? (
        <Loader2 size={iconSize} className="animate-spin" />
      ) : (
        <Volume2 size={iconSize} />
      )}
    </button>
  )
}
