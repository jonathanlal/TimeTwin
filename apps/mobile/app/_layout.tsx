import React, { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { ThemeProvider } from '@timetwin/theme';
import { AuthProvider } from '../src/contexts/AuthContext';
import { validateEnv } from '../src/config/env';

/**
 * Root layout component
 * Wraps the app with necessary providers
 */
export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    // Validate environment variables on app start
    validateEnv();
  }, []);

  useEffect(() => {
    const handleUrl = (url: string | null) => {
      if (!url) return;
      const parsed = Linking.parse(url);
      const path = parsed?.path ?? '';
      if (path === 'capture-now') {
        const trigger = String(parsed.queryParams?.trigger ?? Date.now())
        router.push({
          pathname: '/(tabs)/index',
          params: {
            autoCapture: '1',
            source: String(parsed.queryParams?.source ?? 'widget'),
            trigger,
          },
        });
      }
    };

    Linking.getInitialURL().then(handleUrl);
    const subscription = Linking.addEventListener('url', (event) => handleUrl(event.url));
    return () => subscription.remove();
  }, [router]);

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
