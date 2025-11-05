import { colors, lightColors, darkColors, type SemanticColors } from './colors';
import { fonts, fontSizes, fontWeights, lineHeights, letterSpacings, textStyles } from './typography';
import { spacing, borderRadius, borderWidth, shadows, zIndices, opacity } from './spacing';

/**
 * Complete theme object
 */
export interface Theme {
  colors: SemanticColors;
  rawColors: typeof colors;
  fonts: typeof fonts;
  fontSizes: typeof fontSizes;
  fontWeights: typeof fontWeights;
  lineHeights: typeof lineHeights;
  letterSpacings: typeof letterSpacings;
  textStyles: typeof textStyles;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  borderWidth: typeof borderWidth;
  shadows: typeof shadows;
  zIndices: typeof zIndices;
  opacity: typeof opacity;
  isDark: boolean;
}

/**
 * Light theme
 */
export const lightTheme: Theme = {
  colors: lightColors,
  rawColors: colors,
  fonts,
  fontSizes,
  fontWeights,
  lineHeights,
  letterSpacings,
  textStyles,
  spacing,
  borderRadius,
  borderWidth,
  shadows,
  zIndices,
  opacity,
  isDark: false,
};

/**
 * Dark theme
 */
export const darkTheme: Theme = {
  colors: darkColors,
  rawColors: colors,
  fonts,
  fontSizes,
  fontWeights,
  lineHeights,
  letterSpacings,
  textStyles,
  spacing,
  borderRadius,
  borderWidth,
  shadows,
  zIndices,
  opacity,
  isDark: true,
};

/**
 * Default theme (light)
 */
export const defaultTheme = lightTheme;
