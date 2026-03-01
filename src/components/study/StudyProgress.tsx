import { Progress } from "@/components/ui/progress"

interface StudyProgressProps {
  current: number
  total: number
}

export default function StudyProgress({ current, total }: StudyProgressProps) {
  const percent = total > 0 ? (current / total) * 100 : 0

  return (
    <div className="px-6 mb-3">
      <Progress value={percent} />
    </div>
  )
}
