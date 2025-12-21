import { getSupabase } from './client';
import type { LeaderboardEntry, CountryStat, DailyStat } from './types/database';
import type { PostgrestError } from '@supabase/supabase-js';

export interface LeaderboardEntryWithAvatar extends LeaderboardEntry {
  avatar_url?: string | null;
}

export interface LeaderboardResult {
  data: LeaderboardEntryWithAvatar[] | null;
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

  if (error || !data) {
    return { data: null, error };
  }

  // Enrich with avatars - Securely via Signed URLs
  const userIds = data.map(d => d.user_id);
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, avatar_url')
      .in('user_id', userIds)
      .not('avatar_url', 'is', null);
    
    if (profiles && profiles.length > 0) {
      // 1. Separate paths that need signing vs full URLs
      const pathsToSign: string[] = [];
      const profileMap = new Map<string, string>(); // userId -> raw path/url

      profiles.forEach(p => {
        if (p.avatar_url) {
            let path = p.avatar_url;
            // Fix: Handle legacy public URLs if bucket became private
            if (path.startsWith('http') && path.includes('/avatars/')) {
                const parts = path.split('/avatars/');
                if (parts.length > 1) path = parts[1];
            }
            
            profileMap.set(p.user_id, path);
            
            if (!path.startsWith('http')) {
                pathsToSign.push(path);
            }
        }
      });

      // 2. Generate signed URLs in batch
      let signedUrlMap = new Map<string, string>();
      if (pathsToSign.length > 0) {
        const { data: signedData } = await supabase
          .storage
          .from('avatars')
          .createSignedUrls(pathsToSign, 3600); // 1 hour expiry
        
        if (signedData) {
          signedData.forEach(item => {
            if (item.signedUrl) {
              signedUrlMap.set(item.path || '', item.signedUrl);
            }
          });
        }
      }

      // 3. Merge
      const enrichedData = data.map(entry => {
        const rawAvatar = profileMap.get(entry.user_id);
        let finalAvatar = rawAvatar || null;

        // If it was a path, swap with signed URL
        if (rawAvatar && !rawAvatar.startsWith('http')) {
          finalAvatar = signedUrlMap.get(rawAvatar) || null;
        } else if (rawAvatar) {
          finalAvatar = rawAvatar; // Keep http urls (legacy/external)
        }

        return {
          ...entry,
          avatar_url: finalAvatar
        };
      });

      return { data: enrichedData, error: null };
    }
  }

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

  if (error || !data) {
    return { data: null, error };
  }

  // Enrich with avatars - Securely via Signed URLs
  const userIds = data.map(d => d.user_id);
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, avatar_url')
      .in('user_id', userIds)
      .not('avatar_url', 'is', null);
    
    if (profiles && profiles.length > 0) {
      const pathsToSign: string[] = [];
      const profileMap = new Map<string, string>(); 

      profiles.forEach(p => {
        if (p.avatar_url) {
            let path = p.avatar_url;
            if (path.startsWith('http') && path.includes('/avatars/')) {
                const parts = path.split('/avatars/');
                if (parts.length > 1) path = parts[1];
            }
            profileMap.set(p.user_id, path);
            if (!path.startsWith('http')) {
                pathsToSign.push(path);
            }
        }
      });

      let signedUrlMap = new Map<string, string>();
      if (pathsToSign.length > 0) {
        const { data: signedData } = await supabase
          .storage
          .from('avatars')
          .createSignedUrls(pathsToSign, 3600); 
        
        if (signedData) {
          signedData.forEach(item => {
            if (item.signedUrl) {
              signedUrlMap.set(item.path || '', item.signedUrl);
            }
          });
        }
      }

      const enrichedData = data.map(entry => {
        const rawAvatar = profileMap.get(entry.user_id);
        let finalAvatar = rawAvatar || null;

        if (rawAvatar && !rawAvatar.startsWith('http')) {
          finalAvatar = signedUrlMap.get(rawAvatar) || null;
        } else if (rawAvatar) {
          finalAvatar = rawAvatar;
        }

        return {
          ...entry,
          avatar_url: finalAvatar
        };
      });

      return { data: enrichedData, error: null };
    }
  }

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

/**
 * Get countries that have active users
 */
export async function getActiveCountries(): Promise<{ data: any[] | null; error: any }> {
  const supabase = getSupabase();
  const { data } = await supabase.from('profiles').select('country_code');
  if (!data) return { data: [], error: null };
  const codes = [...new Set(data.map((d: any) => d.country_code).filter(Boolean))];
  
  if (codes.length === 0) return { data: [], error: null };
  const { data: countries, error } = await supabase.from('countries').select('*').in('iso_code', codes);
  return { data: countries, error };
}
