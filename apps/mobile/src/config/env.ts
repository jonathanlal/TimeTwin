import Constants from 'expo-constants';

/**
 * Environment configuration
 * These values should be set in .env file or via EAS environment variables
 */

const expoConfig = Constants.expoConfig;
const extra = expoConfig?.extra || {};

export const env = {
  supabase: {
    url: process.env.EXPO_PUBLIC_SUPABASE_URL || extra.supabaseUrl || '',
    anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || extra.supabaseAnonKey || '',
  },
  isDev: __DEV__,
  isProduction: process.env.NODE_ENV === 'production',
};

/**
 * Validate that required environment variables are set
 */
export function validateEnv(): void {
  const missing: string[] = [];

  if (!env.supabase.url) {
    missing.push('EXPO_PUBLIC_SUPABASE_URL');
  }

  if (!env.supabase.anonKey) {
    missing.push('EXPO_PUBLIC_SUPABASE_ANON_KEY');
  }

  if (missing.length > 0) {
    const errorMessage = `Missing required environment variables:\n${missing.join('\n')}\n\nPlease create a .env file based on .env.example`;

    if (__DEV__) {
      console.error(errorMessage);
    } else {
      throw new Error(errorMessage);
    }
  }
}
