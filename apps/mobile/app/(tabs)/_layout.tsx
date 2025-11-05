import React from 'react';
import { Text } from 'react-native';
import { Tabs } from 'expo-router';
import { useTheme } from '@timetwin/theme';

export default function TabsLayout() {
  const { theme } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Timer',
          tabBarIcon: ({ color, size }) => <TabBarIcon name="timer" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: 'Leaderboard',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="leaderboard" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <TabBarIcon name="profile" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}

// Simple icon component using Text (you can replace with actual icons later)
function TabBarIcon({ name, color, size }: { name: string; color: string; size: number }) {
  const icons: Record<string, string> = {
    timer: '⏱️',
    leaderboard: '🏆',
    profile: '👤',
  };

  return (
    <Text style={{ fontSize: size, color }}>
      {icons[name] || '•'}
    </Text>
  );
}
