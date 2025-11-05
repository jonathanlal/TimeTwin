/**
 * TimeTwin Theme System
 * Design tokens and theming utilities
 */

// Colors
export { colors, lightColors, darkColors } from './colors';
export type { SemanticColors } from './colors';

// Typography
export {
  fonts,
  fontSizes,
  fontWeights,
  lineHeights,
  letterSpacings,
  textStyles,
} from './typography';

// Spacing & Layout
export {
  spacing,
  borderRadius,
  borderWidth,
  shadows,
  zIndices,
  opacity,
} from './spacing';

// Theme
export { lightTheme, darkTheme, defaultTheme } from './theme';
export type { Theme } from './theme';

// Theme Provider
export { ThemeProvider, useTheme, useThemeColors, useColorScheme } from './ThemeProvider';
export type { ColorScheme } from './ThemeProvider';
