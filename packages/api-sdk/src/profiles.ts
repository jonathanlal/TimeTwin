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

/**
 * Get a user's profile by user ID
 */
export async function getProfile(userId: string): Promise<ProfileResult> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  return { data, error };
}

/**
 * Get the current user's profile
 */
export async function getMyProfile(): Promise<ProfileResult> {
  const supabase = getSupabase();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: { message: 'Not authenticated', code: 'UNAUTHORIZED', details: '', hint: '' } as PostgrestError };
  }

  return getProfile(user.id);
}

/**
 * Update a user's profile
 */
export async function updateProfile(
  userId: string,
  updates: ProfileUpdate
): Promise<ProfileResult> {
  const supabase = getSupabase();

  const updateData: Record<string, unknown> = {
    ...updates,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('profiles')
    // @ts-expect-error - Supabase type inference issue with spreads
    .update(updateData)
    .eq('id', userId)
    .select()
    .single();

  return { data, error };
}

/**
 * Update the current user's profile
 */
export async function updateMyProfile(updates: ProfileUpdate): Promise<ProfileResult> {
  const supabase = getSupabase();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { data: null, error: { message: 'Not authenticated', code: 'UNAUTHORIZED', details: '', hint: '' } as PostgrestError };
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
}): Promise<ProfileResult> {
  const supabase = getSupabase();

  const upsertData: Record<string, unknown> = {
    ...profile,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('profiles')
    .upsert(upsertData as any)
    .select()
    .single();

  return { data, error };
}

/**
 * Search profiles by username
 */
export async function searchProfiles(
  query: string,
  limit: number = 20
): Promise<ProfilesResult> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('is_public', true)
    .ilike('username', `%${query}%`)
    .limit(limit);

  return { data, error };
}

/**
 * Get profiles by country
 */
export async function getProfilesByCountry(
  countryCode: string,
  limit: number = 50
): Promise<ProfilesResult> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('is_public', true)
    .eq('country_code', countryCode)
    .limit(limit);

  return { data, error };
}

/**
 * Get a user's current capture streak (consecutive days with captures)
 */
export async function getUserStreak(userId: string): Promise<{
  streak: number | null;
  error: PostgrestError | Error | null;
}> {
  const supabase = getSupabase();

  try {
    const { data, error } = await supabase.rpc('get_user_streak', {
      p_user_id: userId,
    });

    if (error) {
      return { streak: null, error };
    }

    return { streak: data as number, error: null };
  } catch (err) {
    return {
      streak: null,
      error: err instanceof Error ? err : new Error('Unknown error getting streak'),
    };
  }
}

/**
 * Get the current user's capture streak
 */
export async function getMyStreak(): Promise<{
  streak: number | null;
  error: PostgrestError | Error | null;
}> {
  const supabase = getSupabase();

  try {
    const { data, error } = await supabase.rpc('get_my_streak');

    if (error) {
      return { streak: null, error };
    }

    return { streak: data as number, error: null };
  } catch (err) {
    return {
      streak: null,
      error: err instanceof Error ? err : new Error('Unknown error getting streak'),
    };
  }
}
