import React from 'react';
import { Text, View } from 'react-native';
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
      {/* 1. Friends (Was Timer) */}
      <Tabs.Screen
        name="friends"
        options={{
          title: 'Friends',
          tabBarIcon: ({ color, size }) => <TabBarIcon name="friends" color={color} size={size} />,
        }}
      />

      {/* 2. Leaderboard */}
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: 'Leaderboard',
          tabBarIcon: ({ color, size }) => (
            <TabBarIcon name="leaderboard" color={color} size={size} />
          ),
        }}
      />

      {/* 3. Capture Action (Center Button) */}
      <Tabs.Screen
        name="capture_action"
        options={{
          title: '',
          tabBarLabel: () => null,
          tabBarIcon: ({ size }) => (
            <View style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: theme.colors.primary,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 20,
              elevation: 4,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
            }}>
              <Text style={{ fontSize: 32, color: '#fff', lineHeight: 40 }}>+</Text>
            </View>
          ),
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            // Navigate to hidden 'index' (Timer)
            navigation.navigate('index');
          },
        })}
      />

      {/* 4. History */}
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, size }) => <TabBarIcon name="history" color={color} size={size} />,
        }}
      />

      {/* 5. Profile */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <TabBarIcon name="profile" color={color} size={size} />,
        }}
      />

      {/* HIDDEN TABS */}
      <Tabs.Screen
        name="index"
        options={{
          href: null, // Hidden from tab bar, but accessible via navigation
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

// Simple icon component using Text (you can replace with actual icons later)
function TabBarIcon({ name, color, size }: { name: string; color: string; size: number }) {
  const icons: Record<string, string> = {
    timer: '⏱️',
    history: '📝',
    insights: '📊',
    search: '🔍',
    leaderboard: '🏆',
    profile: '👤',
    friends: '👥',
  };

  return (
    <View style={{ justifyContent: 'center', alignItems: 'center', width: size + 8, height: size + 8 }}>
      <Text style={{ fontSize: size, color, lineHeight: size + 4 }}>
        {icons[name] || '•'}
      </Text>
    </View>
  );
}
