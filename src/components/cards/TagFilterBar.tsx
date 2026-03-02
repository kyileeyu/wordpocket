import { cn } from "@/lib/utils"

interface TagFilterBarProps {
  tags: string[]
  selected: string | null
  onSelect: (tag: string | null) => void
}

export default function TagFilterBar({ tags, selected, onSelect }: TagFilterBarProps) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1">
      <button
        className={cn(
          "shrink-0 px-3 py-1 rounded-full typo-body-sm transition-colors",
          selected === null
            ? "bg-accent text-white"
            : "bg-bg-subtle text-text-secondary",
        )}
        onClick={() => onSelect(null)}
      >
        전체
      </button>
      {tags.map((tag) => (
        <button
          key={tag}
          className={cn(
            "shrink-0 px-3 py-1 rounded-full typo-body-sm transition-colors",
            selected === tag
              ? "bg-accent text-white"
              : "bg-bg-subtle text-text-secondary",
          )}
          onClick={() => onSelect(selected === tag ? null : tag)}
        >
          {tag}
        </button>
      ))}
    </div>
  )
}
