import React, { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider } from '@timetwin/theme';
import { AuthProvider } from '../src/contexts/AuthContext';
import { validateEnv } from '../src/config/env';
import * as QuickActions from 'expo-quick-actions';
import { useQuickAction } from 'expo-quick-actions/hooks';
import { useWatchConnectivity } from '../hooks/useWatchConnectivity';

function WatchListener() {
  useWatchConnectivity();
  return null;
}

/**
 * Root layout component
 * Wraps the app with necessary providers
 */
export default function RootLayout() {
  const router = useRouter();
  const systemColorScheme = useColorScheme();
  const action = useQuickAction();

  useEffect(() => {
    // Validate environment variables on app start
    validateEnv();

    // Set Quick Actions for home screen shortcuts
    QuickActions.setItems([
      {
        title: 'Capture Time',
        subtitle: 'Record a moment instantly',
        icon: 'compose', // iOS system icon
        id: 'capture',
        params: { href: '/(tabs)/index?action=capture' },
      },
    ]);
  }, []);

  // Handle Quick Action launch
  useEffect(() => {
    if (action?.params?.href) {
      router.push(action.params.href as any);
    }
  }, [action, router]);

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
            action: 'capture',
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
    <ThemeProvider 
      storage={{ 
        getItem: AsyncStorage.getItem, 
        setItem: (key, value) => AsyncStorage.setItem(key, value) 
      }}
      systemTheme={systemColorScheme ?? 'light'}
    >
      <AuthProvider>
        <WatchListener />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </AuthProvider>
    </ThemeProvider>
  );
}
