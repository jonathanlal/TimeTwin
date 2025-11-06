/**
 * Database types generated from Supabase schema
 * Based on infra/supabase/migrations/0001_init.sql
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      countries: {
        Row: {
          code: string;
          name: string;
        };
        Insert: {
          code: string;
          name: string;
        };
        Update: {
          code?: string;
          name?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          username: string | null;
          country_code: string | null;
          timezone: string;
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          country_code?: string | null;
          timezone?: string;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string | null;
          country_code?: string | null;
          timezone?: string;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      captures: {
        Row: {
          id: string;
          user_id: string;
          server_ts: string;
          minute_ts: string;
          label_idx: number;
          label_str: string;
          diff_seconds: number;
          source: string | null;
          device_model: string | null;
          app_version: string | null;
          legacy_id: string | null;
          note: string | null;
          mood: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          server_ts?: string;
          diff_seconds: number;
          source?: string | null;
          device_model?: string | null;
          app_version?: string | null;
          legacy_id?: string | null;
          note?: string | null;
          mood?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          server_ts?: string;
          diff_seconds?: number;
          source?: string | null;
          device_model?: string | null;
          app_version?: string | null;
          legacy_id?: string | null;
          note?: string | null;
          mood?: string | null;
        };
      };
      daily_stats: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          capture_count: number;
          last_updated: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          capture_count?: number;
          last_updated?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          date?: string;
          capture_count?: number;
          last_updated?: string;
        };
      };
    };
    Views: {
      v_leaderboard_total: {
        Row: {
          user_id: string;
          username: string | null;
          country_code: string | null;
          total_captures: number;
        };
      };
      v_country_stats: {
        Row: {
          country_code: string;
          country_name: string;
          total_captures: number;
          user_count: number;
        };
      };
    };
    Functions: {
      record_capture: {
        Args: Record<string, never>;
        Returns: {
          success: boolean;
          message: string;
          capture_id: string | null;
        };
      };
    };
    Enums: Record<string, never>;
  };
}

// Convenience types
export type Country = Database['public']['Tables']['countries']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];
export type Capture = Database['public']['Tables']['captures']['Row'];
export type CaptureInsert = Database['public']['Tables']['captures']['Insert'];
export type DailyStat = Database['public']['Tables']['daily_stats']['Row'];
export type LeaderboardEntry = Database['public']['Views']['v_leaderboard_total']['Row'];
export type CountryStat = Database['public']['Views']['v_country_stats']['Row'];

export type RecordCaptureResult = {
  success: boolean;
  message: string;
  capture_id: string | null;
};
