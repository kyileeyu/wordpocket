import { useQuery } from "@tanstack/react-query"
import { useCallback, useSyncExternalStore } from "react"
import { supabase } from "@/lib/supabase"

// --- useSearchCards ---

interface SearchCardResult {
  card_id: string
  deck_id: string
  word: string
  meaning: string
  deck_name: string
  folder_name: string | null
  status: "new" | "learning" | "review"
}

export function useSearchCards(query: string) {
  return useQuery({
    queryKey: ["search-cards", query],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("search_cards", {
        p_query: query,
      })
      if (error) throw error
      return data as SearchCardResult[]
    },
    enabled: query.length >= 1,
  })
}

// --- useRecentSearches ---

const STORAGE_KEY = "recent-searches"
const MAX_ITEMS = 10

function getStoredSearches(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const listeners = new Set<() => void>()
let snapshot = getStoredSearches()

function emitChange() {
  snapshot = getStoredSearches()
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return snapshot
}

export function useRecentSearches() {
  const searches = useSyncExternalStore(subscribe, getSnapshot)

  const addRecentSearch = useCallback((term: string) => {
    const trimmed = term.trim()
    if (!trimmed) return
    const current = getStoredSearches()
    const filtered = current.filter((s) => s !== trimmed)
    const updated = [trimmed, ...filtered].slice(0, MAX_ITEMS)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    emitChange()
  }, [])

  const clearRecentSearches = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    emitChange()
  }, [])

  return { searches, addRecentSearch, clearRecentSearches }
}
