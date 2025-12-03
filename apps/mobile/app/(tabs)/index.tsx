
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Container, Text, Button, Card, Input } from '@timetwin/ui';
import { useTheme } from '@timetwin/theme';
import { recordCapture, getTodayStats, isTwinTime, type CaptureMood } from '@timetwin/api-sdk';
import { useAuth } from '../../src/contexts/AuthContext';

const MOOD_OPTIONS: Array<{ value: CaptureMood; label: string; emoji: string }> = [
  { value: 'excited', label: 'Excited', emoji: '✨' },
  { value: 'happy', label: 'Happy', emoji: '😊' },
  { value: 'neutral', label: 'Neutral', emoji: '😐' },
  { value: 'thoughtful', label: 'Thoughtful', emoji: '🤔' },
  { value: 'grateful', label: 'Grateful', emoji: '💗' },
  { value: 'hopeful', label: 'Hopeful', emoji: '⭐' },
];

export default function TimerScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams<{ autoCapture?: string; source?: string; trigger?: string }>();
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [todayCount, setTodayCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState('');
  const [mood, setMood] = useState<CaptureMood | null>(null);
  const [serverWindowOpen, setServerWindowOpen] = useState(false);
  const [handledWidgetTrigger, setHandledWidgetTrigger] = useState<string | null>(null);

  // Load today's stats
  useEffect(() => {
    loadTodayStats();
  }, []);

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Poll server twin-time window to keep UI truthful
  useEffect(() => {
    let mounted = true;

    const checkWindow = async () => {
      try {
        const { open } = await isTwinTime();
        if (mounted) {
          setServerWindowOpen(open);
        }
      } catch (error) {
        console.error('Failed to check twin time window:', error);
      }
    };

    checkWindow();
    const interval = setInterval(checkWindow, 10000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const loadTodayStats = async () => {
    try {
      const { data } = await getTodayStats();
      if (data) {
        setTodayCount(data.capture_count);
      }
    } catch (error) {
      console.error('Failed to load today stats:', error);
    }
  };

  useEffect(() => {
    const trigger = typeof params.trigger === 'string' ? params.trigger : null;
    if (params.autoCapture === '1' && trigger && handledWidgetTrigger !== trigger) {
      setHandledWidgetTrigger(trigger);
      handleWidgetCapture(String(params.source ?? 'widget')).finally(() => {
        router.setParams({
          autoCapture: undefined as any,
          source: undefined as any,
          trigger: undefined as any,
        });
      });
    }
  }, [params.autoCapture, params.trigger, params.source, handledWidgetTrigger, router]);

  const handleCapture = async () => {
    if (!serverWindowOpen) {
      Alert.alert('Wait', 'Server window closed. Wait until the hour matches the minute (e.g. 11:11).');
      return;
    }
    setLoading(true);

    try {
      const { data, error } = await recordCapture({
        note: note.trim() || undefined,
        mood: mood || undefined,
      });

      if (error) {
        Alert.alert('Error', error.message || 'Failed to record capture');
        return;
      }

      if (data && data.success) {
        Alert.alert('Success!', data.message, [
          {
            text: 'OK',
            onPress: () => {
              setNote('');
              setMood(null);
              loadTodayStats();
            },
          },
        ]);
      } else {
        Alert.alert('Notice', data?.message || 'Capture recorded', [
          {
            text: 'OK',
            onPress: () => {
              setNote('');
              setMood(null);
              loadTodayStats();
            },
          },
        ]);
      }
    } catch (error) {
      console.error('Capture error:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleWidgetCapture = async (sourceLabel?: string) => {
    setLoading(true);
    try {
      const { data, error } = await recordCapture({});

      if (error) {
        Alert.alert('Widget capture failed', error.message || 'Failed to record capture');
        return;
      }

      const via = sourceLabel ? ` (via ${sourceLabel})` : '';

      if (data && data.success) {
        Alert.alert('Captured!', data.message + via);
      } else {
        Alert.alert('Heads up', (data?.message || 'Capture recorded') + via);
      }

      setNote('');
      setMood(null);
      loadTodayStats();
    } catch (error) {
      console.error('Widget capture error:', error);
      Alert.alert('Error', 'Unable to record capture from widget');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = () => {
    const hours = currentTime.getHours().toString().padStart(2, '0');
    const minutes = currentTime.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const formatSeconds = () => {
    return `:${currentTime.getSeconds().toString().padStart(2, '0')}`;
  };

  return (
    <Container centered>
      <View style={styles.content}>
        <Card variant="elevated" padding={8} style={[styles.timerCard, { gap: theme.spacing[6] }]}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text variant="caption" color="secondary" align="center">
                Today
              </Text>
              <Text variant="h3" align="center">
                {todayCount}
              </Text>
            </View>
          </View>

          <View style={styles.timerContainer}>
            <Text
              variant="h1"
              align="center"
              style={{
                fontSize: 72,
                lineHeight: 84,
                fontVariantNumeric: ['tabular-nums'],
                letterSpacing: -2,
              }}
            >
              {formatTime()}
              <Text style={{ fontSize: 48, color: theme.colors.textSecondary }}>
                {formatSeconds()}
              </Text>
            </Text>
            <Text variant="caption" color="secondary" align="center" style={{ marginTop: theme.spacing[2] }}>
              {serverWindowOpen 
                ? 'It\'s Twin Time! Capture it now!' 
                : 'Wait for the hour to match the minute...'}
            </Text>
          </View>

          {/* Note & Mood Section */}
          <View style={[styles.noteSection, { gap: theme.spacing[4] }]}>
            <Input
              label="Add a note (optional)"
              placeholder="What are you wishing for?"
              value={note}
              onChangeText={setNote}
              maxLength={200}
              multiline
              numberOfLines={2}
            />

            <View style={{ gap: theme.spacing[2] }}>
              <Text variant="label">Tag your vibe (optional)</Text>
              <View style={styles.moodGrid}>
                {MOOD_OPTIONS.map((option) => {
                  const isSelected = mood === option.value;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      onPress={() => setMood(isSelected ? null : option.value)}
                      style={[
                        styles.moodButton,
                        {
                          backgroundColor: isSelected
                            ? theme.colors.primaryLight
                            : theme.colors.cardBackground,
                          borderColor: isSelected
                            ? theme.colors.primary
                            : theme.colors.border,
                          borderWidth: 2,
                          gap: theme.spacing[1],
                        },
                      ]}
                    >
                      <Text style={{ fontSize: 24 }}>{option.emoji}</Text>
                      <Text
                        variant="caption"
                        style={{
                          fontWeight: isSelected ? '600' : '400',
                          color: isSelected ? theme.colors.primary : theme.colors.text,
                        }}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>

          <Button
            size="lg"
            variant={serverWindowOpen ? 'primary' : 'secondary'}
            onPress={handleCapture}
            loading={loading}
            disabled={loading || !serverWindowOpen}
            fullWidth
          >
            {loading ? 'SAVING...' : serverWindowOpen ? 'SAVE' : 'WAIT'}
          </Button>
        </Card>

        {user && (
          <Text
            variant="bodySmall"
            color="tertiary"
            align="center"
            style={{ marginTop: theme.spacing[4] }}
          >
            Logged in as {user.email}
          </Text>
        )}
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  content: {
    width: '100%',
    maxWidth: 500,
    paddingHorizontal: 20,
  },
  timerCard: {
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    gap: 16,
  },
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
    marginBottom: 24,
  },
  noteSection: {
    width: '100%',
    marginBottom: 24,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  moodButton: {
    flex: 1,
    minWidth: '30%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    gap: 8,
  },
});

