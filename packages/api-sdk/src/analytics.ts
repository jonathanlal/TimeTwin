import { getSupabase } from './client';
import type { PostgrestError } from '@supabase/supabase-js';

export interface AccuracyStats {
  total_captures: number;
  avg_accuracy: number;
  best_accuracy: number;
  perfect_captures: number;
  great_captures: number;
  good_captures: number;
}

export interface TimeDistribution {
  hour: string;
  count: number;
}

export interface MoodDistribution {
  mood: string;
  count: number;
}

export interface RecentActivity {
  date: string;
  count: number;
}

export interface AnalyticsData {
  accuracy_stats: AccuracyStats;
  time_distribution: TimeDistribution[];
  mood_distribution: MoodDistribution[];
  recent_activity: RecentActivity[];
}

export interface AnalyticsResult {
  data: AnalyticsData | null;
  error: PostgrestError | Error | null;
}

/**
 * Get comprehensive analytics for the current user
 */
export async function getMyAnalytics(): Promise<AnalyticsResult> {
  const supabase = getSupabase();

  try {
    const { data, error } = await supabase.rpc('get_my_analytics');

    if (error) {
      return { data: null, error };
    }

    return { data: data as AnalyticsData, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err : new Error('Unknown error getting analytics'),
    };
  }
}

/**
 * Get accuracy statistics for a specific user
 */
export async function getUserAccuracyStats(userId: string): Promise<{
  data: AccuracyStats | null;
  error: PostgrestError | Error | null;
}> {
  const supabase = getSupabase();

  try {
    const { data, error } = await supabase.rpc('get_user_accuracy_stats', {
      p_user_id: userId,
    });

    if (error) {
      return { data: null, error };
    }

    return { data: data as AccuracyStats, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err : new Error('Unknown error'),
    };
  }
}

/**
 * Get time distribution for a specific user
 */
export async function getUserTimeDistribution(userId: string): Promise<{
  data: TimeDistribution[] | null;
  error: PostgrestError | Error | null;
}> {
  const supabase = getSupabase();

  try {
    const { data, error } = await supabase.rpc('get_user_time_distribution', {
      p_user_id: userId,
    });

    if (error) {
      return { data: null, error };
    }

    return { data: data as TimeDistribution[], error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err : new Error('Unknown error'),
    };
  }
}

/**
 * Get mood distribution for a specific user
 */
export async function getUserMoodDistribution(userId: string): Promise<{
  data: MoodDistribution[] | null;
  error: PostgrestError | Error | null;
}> {
  const supabase = getSupabase();

  try {
    const { data, error } = await supabase.rpc('get_user_mood_distribution', {
      p_user_id: userId,
    });

    if (error) {
      return { data: null, error };
    }

    return { data: data as MoodDistribution[], error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err : new Error('Unknown error'),
    };
  }
}

/**
 * Get recent activity for a specific user
 */
export async function getUserRecentActivity(
  userId: string,
  days: number = 30
): Promise<{
  data: RecentActivity[] | null;
  error: PostgrestError | Error | null;
}> {
  const supabase = getSupabase();

  try {
    const { data, error } = await supabase.rpc('get_user_recent_activity', {
      p_user_id: userId,
      p_days: days,
    });

    if (error) {
      return { data: null, error };
    }

    return { data: data as RecentActivity[], error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err : new Error('Unknown error'),
    };
  }
}
