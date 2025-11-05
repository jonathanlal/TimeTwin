/**
 * Color tokens for TimeTwin
 * Organized by semantic purpose with light and dark mode variants
 */

export const colors = {
  // Base colors
  white: '#FFFFFF',
  black: '#000000',

  // Gray scale
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
    950: '#0D0F12',
  },

  // Primary brand colors (blue)
  primary: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },

  // Secondary colors (purple)
  secondary: {
    50: '#FAF5FF',
    100: '#F3E8FF',
    200: '#E9D5FF',
    300: '#D8B4FE',
    400: '#C084FC',
    500: '#A855F7',
    600: '#9333EA',
    700: '#7E22CE',
    800: '#6B21A8',
    900: '#581C87',
  },

  // Success (green)
  success: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E',
    600: '#16A34A',
    700: '#15803D',
    800: '#166534',
    900: '#14532D',
  },

  // Warning (yellow/orange)
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },

  // Error (red)
  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },

  // Info (cyan)
  info: {
    50: '#ECFEFF',
    100: '#CFFAFE',
    200: '#A5F3FC',
    300: '#67E8F9',
    400: '#22D3EE',
    500: '#06B6D4',
    600: '#0891B2',
    700: '#0E7490',
    800: '#155E75',
    900: '#164E63',
  },
} as const;

/**
 * Semantic color mappings for light mode
 */
export const lightColors = {
  // Backgrounds
  background: colors.white,
  backgroundSecondary: colors.gray[50],
  backgroundTertiary: colors.gray[100],

  // Surfaces
  surface: colors.white,
  surfaceSecondary: colors.gray[50],
  surfaceHover: colors.gray[100],
  surfacePressed: colors.gray[200],

  // Borders
  border: colors.gray[200],
  borderSecondary: colors.gray[300],
  borderFocus: colors.primary[500],

  // Text
  text: colors.gray[900],
  textSecondary: colors.gray[600],
  textTertiary: colors.gray[500],
  textDisabled: colors.gray[400],
  textInverse: colors.white,

  // Interactive
  primary: colors.primary[600],
  primaryHover: colors.primary[700],
  primaryPressed: colors.primary[800],
  primaryDisabled: colors.primary[300],

  secondary: colors.secondary[600],
  secondaryHover: colors.secondary[700],
  secondaryPressed: colors.secondary[800],

  // Status
  success: colors.success[600],
  successBg: colors.success[50],
  warning: colors.warning[600],
  warningBg: colors.warning[50],
  error: colors.error[600],
  errorBg: colors.error[50],
  info: colors.info[600],
  infoBg: colors.info[50],

  // Shadows
  shadow: 'rgba(0, 0, 0, 0.1)',
  shadowMedium: 'rgba(0, 0, 0, 0.15)',
  shadowLarge: 'rgba(0, 0, 0, 0.2)',
} as const;

/**
 * Semantic color mappings for dark mode
 */
export const darkColors = {
  // Backgrounds
  background: colors.gray[950],
  backgroundSecondary: colors.gray[900],
  backgroundTertiary: colors.gray[800],

  // Surfaces
  surface: colors.gray[900],
  surfaceSecondary: colors.gray[800],
  surfaceHover: colors.gray[700],
  surfacePressed: colors.gray[600],

  // Borders
  border: colors.gray[700],
  borderSecondary: colors.gray[600],
  borderFocus: colors.primary[400],

  // Text
  text: colors.gray[50],
  textSecondary: colors.gray[300],
  textTertiary: colors.gray[400],
  textDisabled: colors.gray[600],
  textInverse: colors.gray[900],

  // Interactive
  primary: colors.primary[500],
  primaryHover: colors.primary[400],
  primaryPressed: colors.primary[300],
  primaryDisabled: colors.primary[800],

  secondary: colors.secondary[500],
  secondaryHover: colors.secondary[400],
  secondaryPressed: colors.secondary[300],

  // Status
  success: colors.success[500],
  successBg: colors.success[900],
  warning: colors.warning[500],
  warningBg: colors.warning[900],
  error: colors.error[500],
  errorBg: colors.error[900],
  info: colors.info[500],
  infoBg: colors.info[900],

  // Shadows
  shadow: 'rgba(0, 0, 0, 0.3)',
  shadowMedium: 'rgba(0, 0, 0, 0.4)',
  shadowLarge: 'rgba(0, 0, 0, 0.5)',
} as const;

export type SemanticColors = typeof lightColors;
