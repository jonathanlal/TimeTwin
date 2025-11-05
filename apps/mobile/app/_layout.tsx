import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { ThemeProvider } from '@timetwin/theme';
import { AuthProvider } from '../src/contexts/AuthContext';
import { validateEnv } from '../src/config/env';

/**
 * Root layout component
 * Wraps the app with necessary providers
 */
export default function RootLayout() {
  useEffect(() => {
    // Validate environment variables on app start
    validateEnv();
  }, []);

  return (
    <ThemeProvider initialColorScheme="light">
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </AuthProvider>
    </ThemeProvider>
  );
}
