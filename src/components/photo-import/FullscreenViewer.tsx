import { useState, useRef, useCallback, useEffect } from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"
import type { ImportImage } from "@/types/photo-import"

interface FullscreenViewerProps {
  images: ImportImage[]
  initialIndex: number
  onClose: () => void
  onIndexChange: (index: number) => void
}

export default function FullscreenViewer({
  images,
  initialIndex,
  onClose,
  onIndexChange,
}: FullscreenViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const touchStartRef = useRef({ x: 0, y: 0 })
  const [offsetX, setOffsetX] = useState(0)
  const [transitioning, setTransitioning] = useState(false)

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = ""
    }
  }, [])

  const goTo = useCallback(
    (index: number) => {
      if (index < 0 || index >= images.length) return
      setTransitioning(true)
      setCurrentIndex(index)
      onIndexChange(index)
      setOffsetX(0)
      setTimeout(() => setTransitioning(false), 200)
    },
    [images.length, onIndexChange]
  )

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    }
    setTransitioning(false)
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - touchStartRef.current.x
    setOffsetX(dx)
  }, [])

  const handleTouchEnd = useCallback(() => {
    if (Math.abs(offsetX) > 80) {
      if (offsetX < 0 && currentIndex < images.length - 1) {
        goTo(currentIndex + 1)
      } else if (offsetX > 0 && currentIndex > 0) {
        goTo(currentIndex - 1)
      } else {
        setOffsetX(0)
      }
    } else {
      setOffsetX(0)
    }
  }, [offsetX, currentIndex, images.length, goTo])

  return createPortal(
    <div className="fixed inset-0 z-[60] bg-black/90 flex flex-col">
      {/* Close button */}
      <div className="flex justify-end p-4">
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Image */}
      <div
        className="flex-1 flex items-center justify-center overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={images[currentIndex]?.thumbnailUrl}
          alt={`페이지 ${currentIndex + 1}`}
          className="object-contain w-full h-full p-4"
          style={{
            transform: `translateX(${offsetX}px)`,
            transition: transitioning ? "transform 200ms ease" : "none",
          }}
          draggable={false}
        />
      </div>

      {/* Page indicator */}
      <div className="flex justify-center gap-1.5 pb-8">
        {images.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-colors ${
              i === currentIndex ? "bg-white" : "bg-white/30"
            }`}
          />
        ))}
      </div>
    </div>,
    document.body
  )
}
