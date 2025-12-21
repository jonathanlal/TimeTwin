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

export interface Storage {
  getItem: (key: string) => Promise<string | null> | string | null;
  setItem: (key: string, value: string) => Promise<void> | void;
}

interface ThemeProviderProps {
  children: ReactNode;
  initialColorScheme?: ColorScheme;
  storageKey?: string;
  storage?: Storage;
  systemTheme?: 'light' | 'dark';
}

/**
 * Get system color scheme preference
 */
function getSystemColorScheme(): 'light' | 'dark' {
  // For React Native, we'll need to use Appearance API or passed prop
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
  initialColorScheme = 'auto', // Default to auto -> system
  storageKey = 'timetwin-color-scheme',
  storage,
  systemTheme,
}: ThemeProviderProps) {
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>(initialColorScheme);
  
  // Use passed systemTheme or detect
  const [internalSystemScheme, setInternalSystemScheme] = useState<'light' | 'dark'>(() => {
    if (systemTheme) return systemTheme;
    return getSystemColorScheme();
  });

  // Effect to update system scheme from prop or detection
  useEffect(() => {
    if (systemTheme) {
      setInternalSystemScheme(systemTheme);
      return;
    }

    // Web detection
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      setInternalSystemScheme(mediaQuery.matches ? 'dark' : 'light');

      const handler = (e: MediaQueryListEvent) => {
        setInternalSystemScheme(e.matches ? 'dark' : 'light');
      };

      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, [systemTheme]);

  const activeScheme = colorScheme === 'auto' ? internalSystemScheme : colorScheme;
  const theme = activeScheme === 'dark' ? darkTheme : lightTheme;

  // Load color scheme from storage on mount
  useEffect(() => {
    const loadStored = async () => {
      try {
        let stored: string | null = null;
        if (storage) {
          stored = await storage.getItem(storageKey);
        } else if (typeof window !== 'undefined') {
          stored = localStorage.getItem(storageKey);
        }

        if (stored && ['light', 'dark', 'auto'].includes(stored)) {
          setColorSchemeState(stored as ColorScheme);
        }
      } catch (error) {
        console.warn('Failed to load color scheme:', error);
      }
    };
    loadStored();
  }, [storageKey, storage]);

  const setColorScheme = (scheme: ColorScheme) => {
    setColorSchemeState(scheme);

    // Save to storage
    try {
      if (storage) {
        storage.setItem(storageKey, scheme);
      } else if (typeof window !== 'undefined') {
        localStorage.setItem(storageKey, scheme);
      }
    } catch (error) {
      console.warn('Failed to save color scheme:', error);
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
