/**
 * TimeTwin API SDK
 * TypeScript SDK for interacting with the TimeTwin Supabase backend
 */

// Client initialization
export { initSupabase, getSupabase, resetSupabase } from './client';

// Types
export type * from './types/database';

// Auth
export {
  signUp,
  signIn,
  signOut,
  getSession,
  getCurrentUser,
  resetPassword,
  updatePassword,
  onAuthStateChange,
} from './auth';

export type { SignUpParams, SignInParams, AuthResult } from './auth';

// Profiles
export {
  getProfile,
  getMyProfile,
  updateProfile,
  updateMyProfile,
  upsertProfile,
  searchProfiles,
  getProfilesByCountry,
  getUserStreak,
  getMyStreak,
} from './profiles';

export type { ProfileResult, ProfilesResult, StreakResult } from './profiles';

// Captures
export {
  recordCapture,
  getUserCaptures,
  getMyCaptures,
  getTodayCaptures,
  getCapturesByHour,
  getUserCaptureCount,
  getMyCaptureCount,
  isTwinTime,
  updateCapture,
  getCaptureById,
  getPublicUserCaptures,
} from './captures';

export type {
  CapturesResult,
  RecordCaptureResponse,
  CaptureMood,
  RecordCaptureOptions,
} from './captures';

// Leaderboard & Stats
export {
  getGlobalLeaderboard,
  getCountryLeaderboard,
  getMyRank,
  getCountryStats,
  getUserDailyStats,
  getMyDailyStats,
  getTodayStats,
  getActiveCountries,
} from './leaderboard';

export type {
  LeaderboardResult,
  CountryStatsResult,
  DailyStatsResult,
} from './leaderboard';

// Countries
export {
  getAllCountries,
  getCountry,
  searchCountries,
} from './countries';

export type { CountriesResult, CountryResult } from './countries';

// Analytics
export {
  getMyAnalytics,
  getUserAccuracyStats,
  getUserTimeDistribution,
  getUserMoodDistribution,
  getUserRecentActivity,
} from './analytics';

export type {
  AccuracyStats,
  TimeDistribution,
  MoodDistribution,
  RecentActivity,
  AnalyticsData,
  AnalyticsResult,
} from './analytics';

// Social
export * from './social';
