import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { lightTheme, darkTheme, type Theme } from './theme';

export type ColorScheme = 'light' | 'dark' | 'auto';

interface ThemeContextValue {
  theme: Theme;
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
  toggleColorScheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  initialColorScheme?: ColorScheme;
  storageKey?: string;
}

/**
 * Get system color scheme preference
 */
function getSystemColorScheme(): 'light' | 'dark' {
  // For React Native, we'll need to use Appearance API
  // For now, default to light
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

/**
 * Theme provider component
 */
export function ThemeProvider({
  children,
  initialColorScheme = 'light',
  storageKey = 'timetwin-color-scheme',
}: ThemeProviderProps) {
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>(initialColorScheme);
  const [systemScheme, setSystemScheme] = useState<'light' | 'dark'>(getSystemColorScheme());

  // Determine active color scheme
  const activeScheme = colorScheme === 'auto' ? systemScheme : colorScheme;
  const theme = activeScheme === 'dark' ? darkTheme : lightTheme;

  // Listen to system color scheme changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

      const handler = (e: MediaQueryListEvent) => {
        setSystemScheme(e.matches ? 'dark' : 'light');
      };

      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, []);

  // Load color scheme from storage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored && ['light', 'dark', 'auto'].includes(stored)) {
          setColorSchemeState(stored as ColorScheme);
        }
      } catch (error) {
        // Storage not available, use initial value
        console.warn('Failed to load color scheme from storage:', error);
      }
    }
  }, [storageKey]);

  const setColorScheme = (scheme: ColorScheme) => {
    setColorSchemeState(scheme);

    // Save to storage
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKey, scheme);
      } catch (error) {
        console.warn('Failed to save color scheme to storage:', error);
      }
    }
  };

  const toggleColorScheme = () => {
    setColorScheme(activeScheme === 'dark' ? 'light' : 'dark');
  };

  const value: ThemeContextValue = {
    theme,
    colorScheme,
    setColorScheme,
    toggleColorScheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * Hook to access theme context
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}

/**
 * Hook to access just the theme object
 */
export function useThemeColors() {
  const { theme } = useTheme();
  return theme.colors;
}

/**
 * Hook to access color scheme controls
 */
export function useColorScheme() {
  const { colorScheme, setColorScheme, toggleColorScheme } = useTheme();
  return { colorScheme, setColorScheme, toggleColorScheme };
}
