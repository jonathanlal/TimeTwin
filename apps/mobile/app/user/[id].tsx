import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Text, Card, Loading, Button } from '@timetwin/ui';
import { useTheme } from '@timetwin/theme';
import {
  getProfile,
  getUserCaptureCount,
  getUserStreak,
  getUserCaptures,
  type Profile,
  type Capture,
} from '@timetwin/api-sdk';

export default function UserProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const userId = params.id as string;
  const { theme } = useTheme();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [totalCaptures, setTotalCaptures] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [recentCaptures, setRecentCaptures] = useState<Capture[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      loadUserProfile();
    }
  }, [userId]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);

      const [profileResult, captureCountResult, streakResult, capturesResult] = await Promise.all([
        getProfile(userId),
        getUserCaptureCount(userId),
        getUserStreak(userId),
        getUserCaptures(userId, { limit: 5 }),
      ]);

      if (profileResult.error || !profileResult.data) {
        setError('User not found or profile is private');
        return;
      }

      if (!profileResult.data.is_public) {
        setError('This profile is private');
        return;
      }

      setProfile(profileResult.data);

      if (captureCountResult.count !== null) {
        setTotalCaptures(captureCountResult.count);
      }

      if (streakResult.streak !== null) {
        setCurrentStreak(streakResult.streak);
      }

      if (capturesResult.data) {
        setRecentCaptures(capturesResult.data);
      }
    } catch {
      setError('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      paddingTop: 60,
      paddingHorizontal: theme.spacing[4],
      paddingBottom: theme.spacing[4],
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    content: {
      flex: 1,
    },
    scrollContent: {
      padding: theme.spacing[4],
    },
    profileHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing[4],
      marginBottom: theme.spacing[6],
    },
    avatar: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: theme.colors.primaryLight,
      justifyContent: 'center',
      alignItems: 'center',
    },
    statsGrid: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    statItem: {
      flex: 1,
      alignItems: 'center',
    },
    captureItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing[3],
      marginBottom: theme.spacing[2],
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing[8],
      gap: theme.spacing[2],
    },
  });

  if (loading) {
    return <Loading fullScreen text="Loading profile..." />;
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text variant="body" style={{ color: theme.colors.primary }}>
              ← Back
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={{ fontSize: 48 }}>😕</Text>
          <Text variant="body" style={{ color: theme.colors.textSecondary }}>
            {error}
          </Text>
          <Button title="Go Back" onPress={() => router.back()} variant="primary" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text variant="body" style={{ color: theme.colors.primary }}>
            ← Back to Search
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <Card variant="elevated" padding={6} style={{ marginBottom: theme.spacing[4] }}>
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Text style={{ fontSize: 32 }}>👤</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="h2">{profile?.username || 'Anonymous'}</Text>
              <Text variant="caption" style={{ color: theme.colors.textSecondary }}>
                {profile?.country_code && `${profile.country_code} • `}
                {profile?.timezone}
              </Text>
            </View>
          </View>
        </Card>

        {/* Stats Card */}
        <Card variant="elevated" padding={6} style={{ marginBottom: theme.spacing[4] }}>
          <Text variant="h4" style={{ marginBottom: theme.spacing[4] }}>
            Statistics
          </Text>
          <View style={[styles.statsGrid, { gap: theme.spacing[4] }]}>
            <View style={styles.statItem}>
              <Text variant="h3" align="center">
                {totalCaptures}
              </Text>
              <Text variant="caption" color="secondary" align="center">
                Total Captures
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text variant="h3" align="center" style={{ color: theme.colors.primary }}>
                {currentStreak} 🔥
              </Text>
              <Text variant="caption" color="secondary" align="center">
                Day Streak
              </Text>
            </View>
          </View>
        </Card>

        {/* Recent Captures */}
        <Card variant="outlined" padding={6}>
          <Text variant="h4" style={{ marginBottom: theme.spacing[2] }}>
            Recent Captures
          </Text>
          <Text
            variant="caption"
            style={{ color: theme.colors.textSecondary, marginBottom: theme.spacing[4] }}
          >
            Latest 5 time captures
          </Text>

          {recentCaptures.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text variant="body" style={{ color: theme.colors.textSecondary }}>
                No recent captures
              </Text>
            </View>
          ) : (
            <View>
              {recentCaptures.map((capture) => (
                <View key={capture.id} style={styles.captureItem}>
                  <View>
                    <Text variant="body" bold>
                      {capture.label_str}
                    </Text>
                    <Text variant="caption" style={{ color: theme.colors.textSecondary }}>
                      {formatDate(capture.server_ts)}
                    </Text>
                  </View>
                  <View>
                    <Text variant="body" bold>
                      {capture.diff_seconds}s
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </Card>
      </ScrollView>
    </View>
  );
}
