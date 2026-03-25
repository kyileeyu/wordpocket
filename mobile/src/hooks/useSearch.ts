import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "@/lib/supabase";

interface SearchCardResult {
  card_id: string;
  deck_id: string;
  word: string;
  meaning: string;
  deck_name: string;
  folder_name: string | null;
  status: "new" | "learning" | "review";
}

export function useSearchCards(query: string) {
  return useQuery({
    queryKey: ["search-cards", query],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("search_cards", {
        p_query: query,
      });
      if (error) throw error;
      return data as SearchCardResult[];
    },
    enabled: query.length >= 1,
  });
}

const STORAGE_KEY = "recent-searches";
const MAX_ITEMS = 10;

export function useRecentSearches() {
  const [searches, setSearches] = useState<string[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          setSearches(JSON.parse(raw));
        } catch {
          setSearches([]);
        }
      }
    });
  }, []);

  const addRecentSearch = useCallback(async (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setSearches((prev) => {
      const filtered = prev.filter((s) => s !== trimmed);
      const updated = [trimmed, ...filtered].slice(0, MAX_ITEMS);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearRecentSearches = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setSearches([]);
  }, []);

  return { searches, addRecentSearch, clearRecentSearches };
}
