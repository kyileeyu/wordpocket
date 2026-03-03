import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router"
import { Search, X } from "lucide-react"
import SearchResultItem from "./SearchResultItem"
import { useSearchCards, useRecentSearches } from "@/hooks/useSearch"

interface SearchOverlayProps {
  open: boolean
  onClose: () => void
}

export default function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const [input, setInput] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const { data: results, isLoading } = useSearchCards(debouncedQuery)
  const { searches: recentSearches, addRecentSearch, clearRecentSearches } =
    useRecentSearches()

  // Debounce input → debouncedQuery
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(input.trim()), 300)
    return () => clearTimeout(timer)
  }, [input])

  // Auto-focus when opened
  useEffect(() => {
    if (open) {
      // Small delay to ensure DOM is ready after render
      const timer = setTimeout(() => inputRef.current?.focus(), 50)
      return () => clearTimeout(timer)
    }
    // Reset state when closing
    setInput("")
    setDebouncedQuery("")
  }, [open])

  if (!open) return null

  const handleResultClick = (deckId: string) => {
    if (debouncedQuery) addRecentSearch(debouncedQuery)
    onClose()
    navigate(`/deck/${deckId}`)
  }

  const handleRecentClick = (term: string) => {
    setInput(term)
    setDebouncedQuery(term)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) addRecentSearch(input.trim())
  }

  const hasQuery = debouncedQuery.length >= 1
  const noResults = hasQuery && !isLoading && results?.length === 0

  return (
    <div className="fixed inset-0 z-50 bg-bg-primary flex flex-col">
      {/* Search Header */}
      <form onSubmit={handleSubmit} className="px-4 pt-[env(safe-area-inset-top)] shrink-0">
        <div className="flex items-center gap-3 py-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-text-tertiary pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="단어 또는 뜻 검색..."
              className="h-11 w-full rounded-[12px] border border-border bg-bg-subtle pl-10 pr-9 py-[11px] typo-body-md text-text-primary placeholder:text-text-tertiary focus:border-accent focus:ring-2 focus:ring-accent/10 focus:outline-none"
            />
            {input && (
              <button
                type="button"
                onClick={() => {
                  setInput("")
                  inputRef.current?.focus()
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4 text-text-tertiary" />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="typo-body-md text-accent shrink-0"
          >
            취소
          </button>
        </div>
      </form>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {!hasQuery ? (
          /* Recent Searches */
          recentSearches.length > 0 && (
            <div className="px-4 pt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="typo-mono-sm text-text-secondary font-semibold">
                  최근 검색
                </span>
                <button
                  type="button"
                  onClick={clearRecentSearches}
                  className="typo-mono-sm text-text-tertiary"
                >
                  지우기
                </button>
              </div>
              <div className="space-y-0">
                {recentSearches.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => handleRecentClick(term)}
                    className="w-full text-left px-2 py-2.5 flex items-center gap-2.5 active:bg-bg-subtle transition-colors rounded-lg"
                  >
                    <Search className="w-4 h-4 text-text-tertiary shrink-0" />
                    <span className="typo-body-md text-text-primary truncate">
                      {term}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )
        ) : noResults ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center pt-24 px-8 text-center">
            <Search className="w-12 h-12 text-text-tertiary mb-4" />
            <p className="typo-body-md text-text-secondary">
              &ldquo;{debouncedQuery}&rdquo;에 대한
              <br />
              검색 결과가 없습니다
            </p>
          </div>
        ) : (
          /* Results */
          <>
            {results && results.length > 0 && (
              <div>
                <div className="px-4 py-2">
                  <span className="typo-mono-sm text-text-secondary">
                    {results.length}개 결과
                  </span>
                </div>
                <div className="divide-y divide-border">
                  {results.map((r) => (
                    <SearchResultItem
                      key={r.card_id}
                      word={r.word}
                      meaning={r.meaning}
                      deckName={r.deck_name}
                      folderName={r.folder_name}
                      status={r.status}
                      query={debouncedQuery}
                      onClick={() => handleResultClick(r.deck_id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
