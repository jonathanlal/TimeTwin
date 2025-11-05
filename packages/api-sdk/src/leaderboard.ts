import { getSupabase } from './client';
import type { LeaderboardEntry, CountryStat, DailyStat } from './types/database';
import type { PostgrestError } from '@supabase/supabase-js';

export interface LeaderboardResult {
  data: LeaderboardEntry[] | null;
  error: PostgrestError | null;
}

export interface CountryStatsResult {
  data: CountryStat[] | null;
  error: PostgrestError | null;
}

export interface DailyStatsResult {
  data: DailyStat[] | null;
  error: PostgrestError | null;
}

/**
 * Get global leaderboard (total captures)
 */
export async function getGlobalLeaderboard(options?: {
  limit?: number;
  offset?: number;
}): Promise<LeaderboardResult> {
  const supabase = getSupabase();

  let query = supabase
    .from('v_leaderboard_total')
    .select('*')
    .order('total_captures', { ascending: false });

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  const { data, error } = await query;

  return { data, error };
}

/**
 * Get leaderboard filtered by country
 */
export async function getCountryLeaderboard(
  countryCode: string,
  options?: { limit?: number; offset?: number }
): Promise<LeaderboardResult> {
  const supabase = getSupabase();

  let query = supabase
    .from('v_leaderboard_total')
    .select('*')
    .eq('country_code', countryCode)
    .order('total_captures', { ascending: false });

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  const { data, error } = await query;

  return { data, error };
}

/**
 * Get user's rank on the global leaderboard
 */
export async function getMyRank(): Promise<{
  rank: number | null;
  total: number | null;
  error: PostgrestError | null;
}> {
  const supabase = getSupabase();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return {
      rank: null,
      total: null,
      error: { message: 'Not authenticated', code: 'UNAUTHORIZED', details: '', hint: '' } as PostgrestError,
    };
  }

  // Get all leaderboard entries to calculate rank
  const { data, error } = await supabase
    .from('v_leaderboard_total')
    .select('*')
    .order('total_captures', { ascending: false });

  if (error || !data) {
    return { rank: null, total: null, error };
  }

  const userIndex = data.findIndex((entry: any) => entry.user_id === user.id);
  const rank = userIndex >= 0 ? userIndex + 1 : null;

  return { rank, total: data.length, error: null };
}

/**
 * Get country statistics
 */
export async function getCountryStats(options?: {
  limit?: number;
  offset?: number;
}): Promise<CountryStatsResult> {
  const supabase = getSupabase();

  let query = supabase
    .from('v_country_stats')
    .select('*')
    .order('total_captures', { ascending: false });

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  const { data, error } = await query;

  return { data, error };
}

/**
 * Get daily stats for a user
 */
export async function getUserDailyStats(
  userId: string,
  options?: {
    limit?: number;
    startDate?: string;
    endDate?: string;
  }
): Promise<DailyStatsResult> {
  const supabase = getSupabase();

  let query = supabase
    .from('daily_stats')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (options?.startDate) {
    query = query.gte('date', options.startDate);
  }

  if (options?.endDate) {
    query = query.lte('date', options.endDate);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  return { data, error };
}

/**
 * Get the current user's daily stats
 */
export async function getMyDailyStats(options?: {
  limit?: number;
  startDate?: string;
  endDate?: string;
}): Promise<DailyStatsResult> {
  const supabase = getSupabase();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return {
      data: null,
      error: { message: 'Not authenticated', code: 'UNAUTHORIZED', details: '', hint: '' } as PostgrestError,
    };
  }

  return getUserDailyStats(user.id, options);
}

/**
 * Get today's stats for the current user
 */
export async function getTodayStats(): Promise<{
  data: DailyStat | null;
  error: PostgrestError | null;
}> {
  const supabase = getSupabase();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return {
      data: null,
      error: { message: 'Not authenticated', code: 'UNAUTHORIZED', details: '', hint: '' } as PostgrestError,
    };
  }

  const today = new Date().toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('daily_stats')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', today)
    .maybeSingle();

  return { data, error };
}
