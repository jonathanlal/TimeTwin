import { getSupabase } from './client';
import type { Profile, ProfileUpdate } from './types/database';
import type { PostgrestError } from '@supabase/supabase-js';

export interface ProfileResult {
  data: Profile | null;
  error: PostgrestError | null;
}

export interface ProfilesResult {
  data: Profile[] | null;
  error: PostgrestError | null;
}

export interface StreakResult {
  streak: number | null;
  error: PostgrestError | null;
}

const PROFILE_SELECT =
  'user_id, username, country_code, timezone, is_public, privacy, capture_panel_mode, created_at, updated_at, avatar_url';

const normalizeProfile = (row: any): Profile | null => {
  if (!row) return null;
  const userId = row.user_id ?? row.id;
  return { ...row, id: userId } as Profile;
};

const normalizeProfiles = (rows: any[] | null): Profile[] | null =>
  rows ? rows.map((row) => normalizeProfile(row)!).filter(Boolean) : rows;

/**
 * Get a user's profile by user ID
 */
export async function getProfile(userId: string): Promise<ProfileResult> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_SELECT)
    .eq('user_id', userId)
    .maybeSingle();

  return { data: normalizeProfile(data), error };
}

/**
 * Get the current user's profile
 */
export async function getMyProfile(): Promise<ProfileResult> {
  const supabase = getSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      data: null,
      error: { message: 'Not authenticated', code: 'UNAUTHORIZED', details: '', hint: '' } as PostgrestError,
    };
  }

  return getProfile(user.id);
}

/**
 * Update a user's profile (creates a row if it doesn't exist)
 */
export async function updateProfile(
  userId: string,
  updates: ProfileUpdate,
): Promise<ProfileResult> {
  const supabase = getSupabase();

  const { data: existing } = await supabase
    .from('profiles')
    .select(PROFILE_SELECT)
    .eq('user_id', userId)
    .maybeSingle();

  const payload = {
    user_id: userId,
    username: existing?.username ?? null,
    country_code: existing?.country_code ?? null,
    timezone: existing?.timezone ?? 'UTC',
    is_public: typeof updates.is_public === 'boolean' ? updates.is_public : existing?.is_public ?? true,
    privacy:
      typeof updates.is_public === 'boolean'
        ? updates.is_public
          ? 'public'
          : 'private'
        : existing?.privacy ?? 'public',
    capture_panel_mode: (updates.capture_panel_mode ?? existing?.capture_panel_mode ?? 'expanded') as
      | 'expanded'
      | 'collapsed'
      | 'hidden',
    avatar_url: existing?.avatar_url ?? null,
    created_at: existing?.created_at ?? new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...updates,
  };

  const { data, error } = await supabase
    .from('profiles')
    .upsert(payload, { onConflict: 'user_id' })
    .select(PROFILE_SELECT)
    .maybeSingle();

  if (error) {
    return { data: null, error };
  }

  if (!data) {
    return getProfile(userId);
  }

  return { data: normalizeProfile(data), error: null };
}

/**
 * Update the current user's profile
 */
export async function updateMyProfile(updates: ProfileUpdate): Promise<ProfileResult> {
  const supabase = getSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      data: null,
      error: { message: 'Not authenticated', code: 'UNAUTHORIZED', details: '', hint: '' } as PostgrestError,
    };
  }

  return updateProfile(user.id, updates);
}

/**
 * Create or update a user profile (upsert)
 */
export async function upsertProfile(profile: {
  id: string;
  username?: string | null;
  country_code?: string | null;
  timezone?: string;
  is_public?: boolean;
  capture_panel_mode?: 'expanded' | 'collapsed' | 'hidden';
}): Promise<ProfileResult> {
  const supabase = getSupabase();

  const payload = {
    user_id: profile.id,
    username: profile.username ?? null,
    country_code: profile.country_code ?? null,
    timezone: profile.timezone ?? 'UTC',
    is_public: profile.is_public ?? true,
    privacy: (profile.is_public ?? true) ? 'public' : 'private',
    capture_panel_mode: profile.capture_panel_mode ?? 'expanded',
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('profiles')
    .upsert(payload, { onConflict: 'user_id' })
    .select(PROFILE_SELECT)
    .single();

  return { data: normalizeProfile(data), error };
}

/**
 * Get streak count for a specific user
 */
export async function getUserStreak(userId: string): Promise<StreakResult> {
  const supabase = getSupabase();

  const { data, error } = await supabase.rpc('get_user_streak', {
    p_user_id: userId,
  });

  return { streak: (data as number | null) ?? null, error };
}

/**
 * Get the current user's streak
 */
export async function getMyStreak(): Promise<StreakResult> {
  const supabase = getSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      streak: null,
      error: { message: 'Not authenticated', code: 'UNAUTHORIZED', details: '', hint: '' } as PostgrestError,
    };
  }

  return getUserStreak(user.id);
}

/**
 * Search profiles by username
 */
export async function searchProfiles(
  query: string,
  limit: number = 20,
): Promise<ProfilesResult> {
  const supabase = getSupabase();
  const searchTerm = `%${query.trim()}%`;

  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_SELECT)
    .eq('is_public', true)
    .ilike('username', searchTerm)
    .limit(limit);

  return { data: normalizeProfiles(data), error };
}

/**
 * Get profiles by country
 */
export async function getProfilesByCountry(
  countryCode: string,
  limit: number = 50,
): Promise<ProfilesResult> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_SELECT)
    .eq('is_public', true)
    .eq('country_code', countryCode)
    .limit(limit);

  return { data: normalizeProfiles(data), error };
}
