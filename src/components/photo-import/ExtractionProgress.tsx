import { Loader2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"

interface ExtractionProgressProps {
  current: number
  total: number
  error: string | null
  onRetry: () => void
}

export default function ExtractionProgress({
  current,
  total,
  error,
  onRetry,
}: ExtractionProgressProps) {
  const percent = total > 0 ? Math.round((current / total) * 100) : 0

  if (error) {
    return (
      <div className="flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-full bg-danger-bg flex items-center justify-center mb-4">
          <span className="text-2xl">!</span>
        </div>
        <p className="typo-body-md text-text-primary font-semibold mb-2">
          추출에 실패했습니다
        </p>
        <p className="typo-caption text-text-secondary mb-6">{error}</p>
        <Button variant="outline" onClick={onRetry}>
          다시 시도
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center text-center w-full max-w-[280px]">
      <Loader2 className="w-10 h-10 text-accent animate-spin mb-4" />
      <p className="typo-body-md text-text-primary font-semibold mb-1">
        단어를 추출하고 있습니다...
      </p>
      <p className="typo-caption text-text-secondary mb-5">
        잠시만 기다려주세요
      </p>
      <Progress value={percent} className="mb-2" />
      <p className="typo-caption text-text-tertiary">
        {current}/{total} 페이지
      </p>
    </div>
  )
}
