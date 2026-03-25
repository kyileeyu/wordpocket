import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export function useTodayStats() {
  return useQuery({
    queryKey: ["today-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_today_stats");
      if (error) throw error;
      return data as {
        reviewed_count: number;
        new_learned_count: number;
        study_seconds: number;
        memorized_today: number;
      };
    },
  });
}

export function useHeatmapData(days = 28) {
  return useQuery({
    queryKey: ["heatmap-data", days],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_heatmap_data", {
        p_days: days,
      });
      if (error) throw error;
      return data;
    },
  });
}

export function useStreak() {
  return useQuery({
    queryKey: ["streak"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_streak");
      if (error) throw error;
      return data as { current_streak: number };
    },
  });
}

export function useMemorizedWeekly() {
  return useQuery({
    queryKey: ["memorized-weekly"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_memorized_weekly");
      if (error) throw error;
      return data as { date: string; memorized_count: number }[];
    },
  });
}
