import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types/database';

/**
 * Supabase client instance
 * Initialize this with your project URL and anon key
 */
let supabaseClient: SupabaseClient<Database> | null = null;

/**
 * Initialize the Supabase client
 * Must be called before using any SDK functions
 *
 * @param supabaseUrl - Your Supabase project URL
 * @param supabaseAnonKey - Your Supabase anon/public key
 * @returns The initialized Supabase client
 */
export function initSupabase(supabaseUrl: string, supabaseAnonKey: string): SupabaseClient<Database> {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL and anon key are required');
  }

  supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  });

  return supabaseClient;
}

/**
 * Get the current Supabase client instance
 * Throws an error if not initialized
 *
 * @returns The Supabase client
 */
export function getSupabase(): SupabaseClient<Database> {
  if (!supabaseClient) {
    throw new Error(
      'Supabase client not initialized. Call initSupabase() first with your project credentials.'
    );
  }
  return supabaseClient;
}

/**
 * Reset the Supabase client (useful for testing or re-initialization)
 */
export function resetSupabase(): void {
  supabaseClient = null;
}
