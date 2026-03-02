import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { DayTagOption } from "@/types/photo-import"

interface DayTagSheetProps {
  existingDayTags: string[]
  checkedCount: number
  onClose: () => void
  onConfirm: (option: DayTagOption, tag: string, batchSize: number) => void
}

export default function DayTagSheet({
  existingDayTags,
  checkedCount,
  onClose,
  onConfirm,
}: DayTagSheetProps) {
  const [option, setOption] = useState<DayTagOption>("none")
  const [selectedExistingTag, setSelectedExistingTag] = useState(existingDayTags[0] ?? "")
  const [newTag, setNewTag] = useState("")
  const [batchSize, setBatchSize] = useState(30)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Prevent body scroll
    document.body.style.overflow = "hidden"
    // Animate in
    requestAnimationFrame(() => setVisible(true))
    return () => {
      document.body.style.overflow = ""
    }
  }, [])

  const handleClose = () => {
    setVisible(false)
    setTimeout(onClose, 200)
  }

  const handleConfirm = () => {
    const tag =
      option === "existing"
        ? selectedExistingTag
        : option === "new"
        ? newTag
        : ""
    onConfirm(option, tag, batchSize)
  }

  const options: { value: DayTagOption; label: string; description: string }[] = [
    {
      value: "auto",
      label: "자동 생성",
      description: `${batchSize}개씩 묶어 Day 태그 자동 부여`,
    },
    {
      value: "existing",
      label: "기존 Day에 추가",
      description: "이미 있는 Day 태그에 추가",
    },
    {
      value: "new",
      label: "새 Day 태그",
      description: "새로운 Day 태그를 직접 입력",
    },
    {
      value: "none",
      label: "태그 없음",
      description: "Day 태그 없이 생성",
    },
  ]

  return createPortal(
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className={cn(
          "absolute inset-0 bg-text-primary/40 transition-opacity duration-200",
          visible ? "opacity-100" : "opacity-0"
        )}
        onClick={handleClose}
      />

      {/* Sheet */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 rounded-t-[32px] bg-bg-elevated p-6 transition-transform duration-200",
          visible ? "translate-y-0" : "translate-y-full"
        )}
      >
        {/* Handle bar */}
        <div className="flex justify-center mb-4">
          <div className="w-10 h-1 rounded-full bg-text-tertiary/30" />
        </div>

        <h3 className="typo-body-lg font-semibold text-text-primary mb-4">
          Day 태그 할당
        </h3>

        {/* Radio options */}
        <div className="flex flex-col gap-2 mb-4">
          {options.map((opt) => (
            <div key={opt.value}>
              <button
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-[12px] border transition-colors text-left",
                  option === opt.value
                    ? "border-accent bg-accent-bg"
                    : "border-border bg-bg-elevated"
                )}
                onClick={() => setOption(opt.value)}
              >
                {/* Radio circle */}
                <div
                  className={cn(
                    "w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center shrink-0",
                    option === opt.value
                      ? "border-accent"
                      : "border-text-tertiary"
                  )}
                >
                  {option === opt.value && (
                    <div className="w-[10px] h-[10px] rounded-full bg-accent" />
                  )}
                </div>
                <div>
                  <div className="typo-body-sm font-semibold text-text-primary">
                    {opt.label}
                  </div>
                  <div className="typo-caption text-text-secondary">
                    {opt.description}
                  </div>
                </div>
              </button>

              {/* Auto batch size */}
              {opt.value === "auto" && option === "auto" && (
                <div className="flex items-center gap-2 mt-2 ml-9">
                  <label className="typo-caption text-text-secondary shrink-0">
                    묶음 크기
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={batchSize}
                    onChange={(e) => setBatchSize(Math.max(1, Number(e.target.value)))}
                    className="w-16 rounded-lg border border-border bg-bg-subtle px-2 py-1 typo-body-sm text-center text-text-primary"
                  />
                </div>
              )}

              {/* Existing day tags list */}
              {opt.value === "existing" && option === "existing" && (
                <div className="mt-2 ml-9 flex flex-wrap gap-2">
                  {existingDayTags.length === 0 ? (
                    <p className="typo-caption text-text-tertiary">
                      기존 Day 태그가 없습니다
                    </p>
                  ) : (
                    existingDayTags.map((tag) => (
                      <button
                        key={tag}
                        className={cn(
                          "px-3 py-1 rounded-full typo-caption border transition-colors",
                          selectedExistingTag === tag
                            ? "bg-accent text-white border-accent"
                            : "bg-bg-subtle text-text-secondary border-border"
                        )}
                        onClick={() => setSelectedExistingTag(tag)}
                      >
                        {tag}
                      </button>
                    ))
                  )}
                </div>
              )}

              {/* New tag input */}
              {opt.value === "new" && option === "new" && (
                <div className="mt-2 ml-9">
                  <input
                    type="text"
                    placeholder="예: Day 5"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    className="w-full rounded-lg border border-border bg-bg-subtle px-3 py-2 typo-body-sm text-text-primary placeholder:text-text-tertiary"
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <Button
          className="w-full"
          onClick={handleConfirm}
          disabled={
            (option === "existing" && !selectedExistingTag) ||
            (option === "new" && !newTag.trim())
          }
        >
          {checkedCount}장 생성하기
        </Button>
      </div>
    </div>,
    document.body
  )
}
