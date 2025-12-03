import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@timetwin/theme';
import { Text, Button, Input } from '@timetwin/ui';
import { getMyCaptures, type Capture, type CaptureMood } from '@timetwin/api-sdk';

const MOOD_EMOJIS: Record<CaptureMood, string> = {
  excited: '✨',
  happy: '😊',
  neutral: '😐',
  thoughtful: '🤔',
  grateful: '💗',
  hopeful: '⭐',
};

const MOOD_LABELS: Record<CaptureMood, string> = {
  excited: 'Excited',
  happy: 'Happy',
  neutral: 'Neutral',
  thoughtful: 'Thoughtful',
  grateful: 'Grateful',
  hopeful: 'Hopeful',
};

export default function HistoryScreen() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const [captures, setCaptures] = useState<Capture[]>([]);
  const [filteredCaptures, setFilteredCaptures] = useState<Capture[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [moodFilter, setMoodFilter] = useState<string>('all');

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/sign-in');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) {
      loadCaptures();
    }
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [captures, startDate, endDate, moodFilter]);

  const loadCaptures = async () => {
    try {
      setLoading(true);
      const { data, error } = await getMyCaptures({ limit: 1000 });

      if (error) {
        Alert.alert('Error', error.message);
        return;
      }

      if (data) {
        setCaptures(data);
      }
    } catch {
      Alert.alert('Error', 'Failed to load captures');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...captures];

    // Date filters
    if (startDate) {
      filtered = filtered.filter(c => new Date(c.server_ts) >= new Date(startDate));
    }
    if (endDate) {
      filtered = filtered.filter(c => new Date(c.server_ts) <= new Date(endDate + 'T23:59:59'));
    }

    // Mood filter
    if (moodFilter !== 'all') {
      if (moodFilter === 'none') {
        filtered = filtered.filter(c => !c.mood);
      } else {
        filtered = filtered.filter(c => c.mood === moodFilter);
      }
    }

    setFilteredCaptures(filtered);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimingColor = (diffSeconds: number) => {
    if (diffSeconds <= 3) return theme.colors.success;
    if (diffSeconds <= 10) return theme.colors.warning;
    return theme.colors.textSecondary;
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      paddingTop: 60,
      paddingHorizontal: 16,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    content: {
      flex: 1,
    },
    scrollContent: {
      padding: 16,
    },
    filterSection: {
      backgroundColor: theme.colors.surface,
      padding: 16,
      borderRadius: theme.borderRadius.md,
      marginBottom: 16,
      gap: 12,
    },
    moodFilterContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    moodFilterButton: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: theme.borderRadius.sm,
      borderWidth: 1,
    },
    captureCard: {
      backgroundColor: theme.colors.surface,
      padding: 16,
      borderRadius: theme.borderRadius.md,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    captureHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 8,
    },
    moodEmoji: {
      fontSize: 24,
    },
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 32,
      gap: 8,
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

  if (authLoading || !user) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <Text variant="body">Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="h1">Capture History</Text>
        <Text variant="caption" style={{ color: theme.colors.textSecondary }}>
          View all your time captures with notes and moods
        </Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {/* Filters */}
        <View style={styles.filterSection}>
          <Text variant="label">Filters</Text>

          <Input
            label="Start Date"
            placeholder="YYYY-MM-DD"
            value={startDate}
            onChangeText={setStartDate}
          />

          <Input
            label="End Date"
            placeholder="YYYY-MM-DD"
            value={endDate}
            onChangeText={setEndDate}
          />

          <View>
            <Text variant="label" style={{ marginBottom: theme.spacing[2] }}>Mood</Text>
            <View style={styles.moodFilterContainer}>
              <Button
                variant={moodFilter === 'all' ? 'primary' : 'secondary'}
                onPress={() => setMoodFilter('all')}
                style={{ flex: 0 }}
              >
                All
              </Button>
              <Button
                variant={moodFilter === 'none' ? 'primary' : 'secondary'}
                onPress={() => setMoodFilter('none')}
                style={{ flex: 0 }}
              >
                No mood
              </Button>
              {(Object.keys(MOOD_LABELS) as CaptureMood[]).map((mood) => (
                <Button
                  key={mood}
                  variant={moodFilter === mood ? 'primary' : 'secondary'}
                  onPress={() => setMoodFilter(mood)}
                  style={{ flex: 0 }}
                >
                  {MOOD_EMOJIS[mood]}
                </Button>
              ))}
            </View>
          </View>
        </View>

        {/* Captures List */}
        {loading ? (
          <View style={styles.emptyContainer}>
            <Text variant="body" style={{ color: theme.colors.textSecondary }}>
              Loading captures...
            </Text>
          </View>
        ) : filteredCaptures.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={{ fontSize: 48 }}>📝</Text>
            <Text variant="body" style={{ color: theme.colors.textSecondary }}>
              {captures.length === 0
                ? 'No captures yet. Start capturing time on the timer tab!'
                : 'No captures match your filters.'}
            </Text>
          </View>
        ) : (
          <>
            {filteredCaptures.map((capture) => (
              <View key={capture.id} style={styles.captureCard}>
                <View style={styles.captureHeader}>
                  {capture.mood && (
                    <Text style={styles.moodEmoji}>
                      {MOOD_EMOJIS[capture.mood as CaptureMood]}
                    </Text>
                  )}
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing[2] }}>
                      <Text variant="h3">{capture.label_str || 'N/A'}</Text>
                      <Text
                        variant="caption"
                        style={{ color: getTimingColor(capture.diff_seconds), fontWeight: '600' }}
                      >
                        {capture.diff_seconds}s
                      </Text>
                    </View>
                    <Text variant="caption" style={{ color: theme.colors.textSecondary }}>
                      {formatDate(capture.server_ts)}
                    </Text>
                  </View>
                </View>
                {capture.note && (
                  <Text
                    variant="body"
                    style={{ color: theme.colors.textSecondary, fontStyle: 'italic' }}
                  >
                    "{capture.note}"
                  </Text>
                )}
                {capture.mood && (
                  <Text
                    variant="caption"
                    style={{ color: theme.colors.textSecondary, marginTop: theme.spacing[1] }}
                  >
                    {MOOD_LABELS[capture.mood as CaptureMood]}
                  </Text>
                )}
              </View>
            ))}

            {/* Summary */}
            <View style={[styles.captureCard, { alignItems: 'center' }]}>
              <Text variant="caption" style={{ color: theme.colors.textSecondary }}>
                Showing {filteredCaptures.length} of {captures.length} total captures
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
