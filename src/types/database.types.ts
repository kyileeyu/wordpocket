export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          nickname: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          nickname?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          nickname?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      folders: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          color: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          color?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          color?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      decks: {
        Row: {
          id: string;
          user_id: string;
          folder_id: string | null;
          name: string;
          description: string | null;
          color: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          folder_id?: string | null;
          name: string;
          description?: string | null;
          color?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          folder_id?: string | null;
          name?: string;
          description?: string | null;
          color?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      cards: {
        Row: {
          id: string;
          deck_id: string;
          word: string;
          meaning: string;
          example: string | null;
          pronunciation: string | null;
          tags: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          deck_id: string;
          word: string;
          meaning: string;
          example?: string | null;
          pronunciation?: string | null;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          deck_id?: string;
          word?: string;
          meaning?: string;
          example?: string | null;
          pronunciation?: string | null;
          tags?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      card_states: {
        Row: {
          id: string;
          card_id: string;
          user_id: string;
          status: 'new' | 'learning' | 'review' | 'suspended';
          ease_factor: number;
          interval: number;
          due_date: string;
          step_index: number;
          lapse_count: number;
          last_reviewed_at: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          card_id: string;
          user_id: string;
          status?: 'new' | 'learning' | 'review' | 'suspended';
          ease_factor?: number;
          interval?: number;
          due_date?: string;
          step_index?: number;
          lapse_count?: number;
          last_reviewed_at?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          card_id?: string;
          user_id?: string;
          status?: 'new' | 'learning' | 'review' | 'suspended';
          ease_factor?: number;
          interval?: number;
          due_date?: string;
          step_index?: number;
          lapse_count?: number;
          last_reviewed_at?: string | null;
          updated_at?: string;
        };
      };
      review_logs: {
        Row: {
          id: string;
          card_id: string;
          user_id: string;
          rating: 'again' | 'hard' | 'good' | 'easy';
          interval_before: number;
          interval_after: number;
          ease_before: number;
          ease_after: number;
          review_duration: number | null;
          reviewed_at: string;
        };
        Insert: {
          id?: string;
          card_id: string;
          user_id: string;
          rating: 'again' | 'hard' | 'good' | 'easy';
          interval_before?: number;
          interval_after?: number;
          ease_before?: number;
          ease_after?: number;
          review_duration?: number | null;
          reviewed_at?: string;
        };
        Update: {
          id?: string;
          card_id?: string;
          user_id?: string;
          rating?: 'again' | 'hard' | 'good' | 'easy';
          interval_before?: number;
          interval_after?: number;
          ease_before?: number;
          ease_after?: number;
          review_duration?: number | null;
          reviewed_at?: string;
        };
      };
      user_settings: {
        Row: {
          id: string;
          user_id: string;
          new_cards_per_day: number;
          learning_steps: number[];
          graduating_interval: number;
          easy_interval: number;
          max_interval: number;
          leech_threshold: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          new_cards_per_day?: number;
          learning_steps?: number[];
          graduating_interval?: number;
          easy_interval?: number;
          max_interval?: number;
          leech_threshold?: number;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          new_cards_per_day?: number;
          learning_steps?: number[];
          graduating_interval?: number;
          easy_interval?: number;
          max_interval?: number;
          leech_threshold?: number;
          updated_at?: string;
        };
      };
    };
    Functions: {
      get_study_queue: {
        Args: {
          p_deck_id: string;
          p_limit?: number;
        };
        Returns: {
          card_id: string;
          word: string;
          meaning: string;
          example: string | null;
          pronunciation: string | null;
          tags: string[];
          status: string;
          ease_factor: number;
          interval: number;
          due_date: string;
          step_index: number;
          lapse_count: number;
          queue_type: string;
        }[];
      };
      submit_review: {
        Args: {
          p_card_id: string;
          p_rating: string;
          p_review_duration?: number;
        };
        Returns: Json;
      };
      get_today_stats: {
        Args: Record<string, never>;
        Returns: Json;
      };
      get_heatmap_data: {
        Args: {
          p_days?: number;
        };
        Returns: {
          date: string;
          review_count: number;
        }[];
      };
      get_streak: {
        Args: Record<string, never>;
        Returns: Json;
      };
      get_deck_progress: {
        Args: Record<string, never>;
        Returns: {
          deck_id: string;
          deck_name: string;
          folder_id: string | null;
          total_cards: number;
          new_count: number;
          learning_count: number;
          review_count: number;
          suspended_count: number;
          due_today: number;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
  };
};

// Convenience type aliases
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type InsertDto<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type UpdateDto<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];
