import { getSupabase } from './client';
import type { Capture, RecordCaptureResult } from './types/database';
import type { PostgrestError } from '@supabase/supabase-js';

export interface CapturesResult {
  data: Capture[] | null;
  error: PostgrestError | null;
}

export interface RecordCaptureResponse {
  data: RecordCaptureResult | null;
  error: PostgrestError | Error | null;
}

export type CaptureMood = 'excited' | 'happy' | 'neutral' | 'thoughtful' | 'grateful' | 'hopeful';

export interface RecordCaptureOptions {
  note?: string;
  mood?: CaptureMood;
}

/**
 * Record a new time capture using the record_capture RPC function
 * This handles validation and updates daily stats automatically
 * @param options - Optional note and mood to attach to the capture
 */
export async function recordCapture(options?: RecordCaptureOptions): Promise<RecordCaptureResponse> {
  const supabase = getSupabase();

  try {
    const { data, error } = await supabase.rpc('record_capture', {
      p_note: options?.note || null,
      p_mood: options?.mood || null,
    });

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err : new Error('Unknown error recording capture'),
    };
  }
}

/**
 * Get captures for a specific user
 */
export async function getUserCaptures(
  userId: string,
  options?: {
    limit?: number;
    offset?: number;
    startDate?: string;
    endDate?: string;
  }
): Promise<CapturesResult> {
  const supabase = getSupabase();

  let query = supabase
    .from('captures')
    .select('*')
    .eq('user_id', userId)
    .order('captured_at', { ascending: false });

  if (options?.startDate) {
    query = query.gte('captured_at', options.startDate);
  }

  if (options?.endDate) {
    query = query.lte('captured_at', options.endDate);
  }

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
 * Get the current user's captures
 */
export async function getMyCaptures(options?: {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
}): Promise<CapturesResult> {
  const supabase = getSupabase();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return {
      data: null,
      error: { message: 'Not authenticated', code: 'UNAUTHORIZED', details: '', hint: '' } as PostgrestError,
    };
  }

  return getUserCaptures(user.id, options);
}

/**
 * Get captures for today
 */
export async function getTodayCaptures(): Promise<CapturesResult> {
  const today = new Date().toISOString().split('T')[0];
  return getMyCaptures({
    startDate: today,
    endDate: `${today}T23:59:59.999Z`,
  });
}

/**
 * Get captures by hour label (e.g., "14:00")
 */
export async function getCapturesByHour(
  hourLabel: string,
  options?: { limit?: number }
): Promise<CapturesResult> {
  const supabase = getSupabase();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return {
      data: null,
      error: { message: 'Not authenticated', code: 'UNAUTHORIZED', details: '', hint: '' } as PostgrestError,
    };
  }

  const { data, error } = await supabase
    .from('captures')
    .select('*')
    .eq('user_id', user.id)
    .eq('hour_label', hourLabel)
    .order('captured_at', { ascending: false })
    .limit(options?.limit || 100);

  return { data, error };
}

/**
 * Get total capture count for a user
 */
export async function getUserCaptureCount(userId: string): Promise<{
  count: number | null;
  error: PostgrestError | null;
}> {
  const supabase = getSupabase();

  const { count, error } = await supabase
    .from('captures')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  return { count, error };
}

/**
 * Get total capture count for the current user
 */
export async function getMyCaptureCount(): Promise<{
  count: number | null;
  error: PostgrestError | null;
}> {
  const supabase = getSupabase();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { count: null, error: { message: 'Not authenticated', code: 'UNAUTHORIZED', details: '', hint: '' } as PostgrestError };
  }

  return getUserCaptureCount(user.id);
}
