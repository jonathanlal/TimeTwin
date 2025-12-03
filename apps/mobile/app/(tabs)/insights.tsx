import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { Text, Card, Loading, Button } from '@timetwin/ui';
import { useTheme } from '@timetwin/theme';
import { getMyAnalytics, type AnalyticsData } from '@timetwin/api-sdk';

const MOOD_EMOJIS: Record<string, string> = {
  excited: '✨',
  happy: '😊',
  neutral: '😐',
  thoughtful: '🤔',
  grateful: '💗',
  hopeful: '⭐',
};

export default function InsightsScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadAnalytics();
    }
  }, [user]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const { data, error } = await getMyAnalytics();

      if (error) {
        setError('Failed to load analytics');
        return;
      }

      if (data) {
        setAnalytics(data);
      }
    } catch {
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const getAccuracyColor = (seconds: number) => {
    if (seconds <= 3) return theme.colors.success;
    if (seconds <= 10) return theme.colors.warning;
    return theme.colors.textSecondary;
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
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing[3],
    },
    statBox: {
      flex: 1,
      minWidth: '45%',
      alignItems: 'center',
      padding: theme.spacing[3],
    },
    distributionItem: {
      marginBottom: theme.spacing[3],
    },
    barContainer: {
      height: 8,
      backgroundColor: theme.colors.cardBackground,
      borderRadius: 4,
      overflow: 'hidden',
      marginTop: theme.spacing[1],
    },
    bar: {
      height: '100%',
      backgroundColor: theme.colors.primary,
    },
    moodGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing[3],
    },
    moodBox: {
      flex: 1,
      minWidth: '45%',
      alignItems: 'center',
      padding: theme.spacing[4],
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 8,
    },
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing[8],
      gap: theme.spacing[2],
    },
  });

  if (loading) {
    return <Loading fullScreen text="Loading analytics..." />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="h1">Your Insights</Text>
        <Text variant="caption" style={{ color: theme.colors.textSecondary }}>
          Analytics about your time captures
        </Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {error ? (
          <Card variant="outlined" padding={8} style={styles.emptyContainer}>
            <Text style={{ fontSize: 48 }}>😕</Text>
            <Text variant="body" style={{ color: theme.colors.textSecondary }}>
              {error}
            </Text>
            <Button onPress={loadAnalytics} variant="primary">Try Again</Button>
          </Card>
        ) : analytics ? (
          <View style={{ gap: theme.spacing[4] }}>
            {/* Accuracy Stats */}
            <Card variant="elevated" padding={6}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing[2], marginBottom: theme.spacing[4] }}>
                <Text style={{ fontSize: 20 }}>🎯</Text>
                <Text variant="h4">Accuracy Statistics</Text>
              </View>
              <View style={styles.statsGrid}>
                <View style={styles.statBox}>
                  <Text variant="h3" style={{ color: getAccuracyColor(analytics.accuracy_stats.avg_accuracy) }}>
                    {analytics.accuracy_stats.avg_accuracy}s
                  </Text>
                  <Text variant="caption" style={{ color: theme.colors.textSecondary }}>
                    Average
                  </Text>
                </View>
                <View style={styles.statBox}>
                  <Text variant="h3" style={{ color: theme.colors.success }}>
                    {analytics.accuracy_stats.best_accuracy}s
                  </Text>
                  <Text variant="caption" style={{ color: theme.colors.textSecondary }}>
                    Best
                  </Text>
                </View>
                <View style={styles.statBox}>
                  <Text variant="h3" style={{ color: theme.colors.success }}>
                    {analytics.accuracy_stats.perfect_captures}
                  </Text>
                  <Text variant="caption" style={{ color: theme.colors.textSecondary }}>
                    Perfect (≤3s)
                  </Text>
                </View>
                <View style={styles.statBox}>
                  <Text variant="h3" style={{ color: theme.colors.warning }}>
                    {analytics.accuracy_stats.great_captures}
                  </Text>
                  <Text variant="caption" style={{ color: theme.colors.textSecondary }}>
                    Great (4-10s)
                  </Text>
                </View>
              </View>
            </Card>

            {/* Time Distribution */}
            {analytics.time_distribution.length > 0 && (
              <Card variant="outlined" padding={6}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing[2], marginBottom: theme.spacing[4] }}>
                  <Text style={{ fontSize: 20 }}>🕐</Text>
                  <Text variant="h4">Time Distribution</Text>
                </View>
                <View>
                  {analytics.time_distribution
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 8)
                    .map((item) => {
                      const maxCount = Math.max(...analytics.time_distribution.map(d => d.count));
                      const percentage = (item.count / maxCount) * 100;
                      return (
                        <View key={item.hour} style={styles.distributionItem}>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing[1] }}>
                            <Text variant="body" bold>{item.hour}</Text>
                            <Text variant="caption" style={{ color: theme.colors.textSecondary }}>
                              {item.count} captures
                            </Text>
                          </View>
                          <View style={styles.barContainer}>
                            <View style={[styles.bar, { width: `${percentage}%` }]} />
                          </View>
                        </View>
                      );
                    })}
                </View>
              </Card>
            )}

            {/* Mood Distribution */}
            {analytics.mood_distribution.length > 0 && (
              <Card variant="outlined" padding={6}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing[2], marginBottom: theme.spacing[4] }}>
                  <Text style={{ fontSize: 20 }}>💗</Text>
                  <Text variant="h4">Mood Distribution</Text>
                </View>
                <View style={styles.moodGrid}>
                  {analytics.mood_distribution.map((item) => (
                    <View key={item.mood} style={styles.moodBox}>
                      <Text style={{ fontSize: 36, marginBottom: theme.spacing[2] }}>
                        {MOOD_EMOJIS[item.mood] || '•'}
                      </Text>
                      <Text variant="body" bold style={{ textTransform: 'capitalize' }}>
                        {item.mood}
                      </Text>
                      <Text variant="h3" style={{ color: theme.colors.primary, marginTop: theme.spacing[2] }}>
                        {item.count}
                      </Text>
                      <Text variant="caption" style={{ color: theme.colors.textSecondary }}>
                        captures
                      </Text>
                    </View>
                  ))}
                </View>
              </Card>
            )}

            {/* Recent Activity */}
            {analytics.recent_activity.length > 0 && (
              <Card variant="outlined" padding={6}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing[2], marginBottom: theme.spacing[4] }}>
                  <Text style={{ fontSize: 20 }}>📈</Text>
                  <Text variant="h4">Recent Activity</Text>
                </View>
                <View>
                  {analytics.recent_activity.slice(0, 10).map((item) => {
                    const date = new Date(item.date);
                    const maxCount = Math.max(...analytics.recent_activity.map(d => d.count));
                    const percentage = (item.count / maxCount) * 100;
                    return (
                      <View key={item.date} style={styles.distributionItem}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing[1] }}>
                          <Text variant="body" bold>
                            {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </Text>
                          <Text variant="caption" style={{ color: theme.colors.textSecondary }}>
                            {item.count} captures
                          </Text>
                        </View>
                        <View style={styles.barContainer}>
                          <View style={[styles.bar, { width: `${percentage}%` }]} />
                        </View>
                      </View>
                    );
                  })}
                </View>
              </Card>
            )}
          </View>
        ) : (
          <Card variant="outlined" padding={8} style={styles.emptyContainer}>
            <Text style={{ fontSize: 48 }}>📊</Text>
            <Text variant="body" style={{ color: theme.colors.textSecondary }}>
              No analytics data available yet.
            </Text>
            <Text variant="caption" style={{ color: theme.colors.textSecondary }}>
              Start capturing time to see your insights!
            </Text>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}
