import { getSupabase } from './client';
import type { User, Session, AuthError } from '@supabase/supabase-js';

export interface SignUpParams {
  email: string;
  password: string;
  username?: string;
  countryCode?: string;
  timezone?: string;
  redirectTo?: string;
}

// ...

export async function signUp({
  email,
  password,
  username,
  countryCode,
  timezone,
  redirectTo,
}: SignUpParams): Promise<AuthResult> {
  const supabase = getSupabase();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectTo,
      data: {
        username: username || null,
        country_code: countryCode || null,
        timezone: timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    },
  });

  return {
    user: data.user,
    session: data.session,
    error,
  };
}

/**
 * Sign in an existing user
 */
export async function signIn({ email, password }: SignInParams): Promise<AuthResult> {
  const supabase = getSupabase();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return {
    user: data.user,
    session: data.session,
    error,
  };
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<{ error: AuthError | null }> {
  const supabase = getSupabase();
  const { error } = await supabase.auth.signOut();
  return { error };
}

/**
 * Get the current session
 */
export async function getSession(): Promise<{ session: Session | null; error: AuthError | null }> {
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.getSession();
  return { session: data.session, error };
}

/**
 * Get the current user
 */
export async function getCurrentUser(): Promise<{ user: User | null; error: AuthError | null }> {
  const supabase = getSupabase();
  const { data, error } = await supabase.auth.getUser();
  return { user: data.user, error };
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<{ error: AuthError | null }> {
  const supabase = getSupabase();
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  return { error };
}

/**
 * Update user password
 */
export async function updatePassword(newPassword: string): Promise<{ error: AuthError | null }> {
  const supabase = getSupabase();
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  return { error };
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(
  callback: (event: string, session: Session | null) => void
): { unsubscribe: () => void } {
  const supabase = getSupabase();
  const { data } = supabase.auth.onAuthStateChange(callback);
  return { unsubscribe: data.subscription.unsubscribe };
}
