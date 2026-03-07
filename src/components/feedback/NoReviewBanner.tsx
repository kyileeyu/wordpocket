interface NoReviewBannerProps {
  nextDueLabel?: string | null
}

export default function NoReviewBanner({ nextDueLabel }: NoReviewBannerProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-accent-bg-soft border border-accent-lighter px-4 py-3">
      <span className="text-[24px] shrink-0">😴</span>
      <div className="min-w-0">
        <p className="typo-body-md font-semibold text-text-primary">지금은 학습할 카드가 없어요</p>
        <p className="typo-caption text-text-tertiary">
          {nextDueLabel ? `다음 학습 예정: ${nextDueLabel}` : "새로운 학습을 진행해보세요!"}
        </p>
      </div>
    </div>
  )
}
