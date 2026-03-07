import { Progress } from "@/components/ui/progress"

interface StudyProgressProps {
  current: number
  total: number
  lapCount?: number
}

export default function StudyProgress({ current, total, lapCount = 0 }: StudyProgressProps) {
  const percent = total > 0 ? (current / total) * 100 : 0

  return (
    <div className="px-7 mb-3 flex items-center gap-2">
      {lapCount > 0 && (
        <span className="text-accent shrink-0">
          {"★".repeat(lapCount)}
        </span>
      )}
      <Progress value={percent} className="flex-1" />
    </div>
  )
}
