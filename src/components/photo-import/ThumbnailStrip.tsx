import { Plus, X } from "lucide-react"
import type { ImportImage } from "@/types/photo-import"
import { cn } from "@/lib/utils"

interface ThumbnailStripProps {
  images: ImportImage[]
  selectedIndex: number
  onSelect: (index: number) => void
  onRemove?: (id: string) => void
  onAdd?: () => void
}

export default function ThumbnailStrip({
  images,
  selectedIndex,
  onSelect,
  onRemove,
  onAdd,
}: ThumbnailStripProps) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1 px-1">
      {images.map((img, i) => (
        <div key={img.id} className="relative shrink-0">
          <button
            onClick={() => onSelect(i)}
            className={cn(
              "w-16 h-16 rounded-[10px] overflow-hidden border-2 transition-all",
              i === selectedIndex
                ? "border-accent ring-2 ring-accent/30"
                : "border-border"
            )}
          >
            <img
              src={img.thumbnailUrl}
              alt={`페이지 ${i + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
          {/* Page number badge */}
          <span className="absolute -top-1 -left-1 w-[18px] h-[18px] rounded-full bg-accent text-white text-[10px] font-semibold flex items-center justify-center">
            {i + 1}
          </span>
          {/* Remove button */}
          {onRemove && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onRemove(img.id)
              }}
              className="absolute -top-1 -right-1 w-[18px] h-[18px] rounded-full bg-danger text-white flex items-center justify-center"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      ))}
      {/* Add button */}
      {onAdd && (
        <button
          onClick={onAdd}
          className="w-16 h-16 rounded-[10px] border-2 border-dashed border-border flex items-center justify-center text-text-tertiary hover:text-text-secondary hover:border-text-tertiary transition-colors shrink-0"
        >
          <Plus className="w-5 h-5" />
        </button>
      )}
    </div>
  )
}
