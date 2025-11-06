import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Container, Text, Button, Card, Input } from '@timetwin/ui';
import { useTheme } from '@timetwin/theme';
import { recordCapture, getTodayStats, type CaptureMood } from '@timetwin/api-sdk';
import { useAuth } from '../../src/contexts/AuthContext';

type CaptureState = 'waiting' | 'capturing' | 'cooldown';

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
  const [state, setState] = useState<CaptureState>('waiting');
  const [seconds, setSeconds] = useState(0);
  const [milliseconds, setMilliseconds] = useState(0);
  const [todayCount, setTodayCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState('');
  const [mood, setMood] = useState<CaptureMood | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // Load today's stats
  useEffect(() => {
    loadTodayStats();
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

  // Timer logic
  useEffect(() => {
    if (state === 'capturing') {
      startTimeRef.current = Date.now();

      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        setSeconds(Math.floor(elapsed / 1000));
        setMilliseconds(Math.floor((elapsed % 1000) / 10));
      }, 10); // Update every 10ms for smooth display

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  }, [state]);

  const handleStart = () => {
    setState('capturing');
    setSeconds(0);
    setMilliseconds(0);
  };

  const handleStop = async () => {
    setState('cooldown');
    setLoading(true);

    try {
      const { data, error } = await recordCapture({
        note: note.trim() || undefined,
        mood: mood || undefined,
      });

      if (error) {
        Alert.alert('Error', error.message || 'Failed to record capture');
        setState('waiting');
        setSeconds(0);
        setMilliseconds(0);
        return;
      }

      if (data && data.success) {
        Alert.alert('Success!', data.message, [
          {
            text: 'OK',
            onPress: () => {
              setState('waiting');
              setSeconds(0);
              setMilliseconds(0);
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
              setState('waiting');
              setSeconds(0);
              setMilliseconds(0);
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
      setState('waiting');
      setSeconds(0);
      setMilliseconds(0);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = () => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatMilliseconds = () => {
    return `.${milliseconds.toString().padStart(2, '0')}`;
  };

  const getButtonText = () => {
    switch (state) {
      case 'waiting':
        return 'Start Capture';
      case 'capturing':
        return 'Stop & Record';
      case 'cooldown':
        return 'Recording...';
      default:
        return 'Start';
    }
  };

  const getButtonVariant = () => {
    switch (state) {
      case 'capturing':
        return 'secondary';
      default:
        return 'primary';
    }
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
                fontVariantNumeric: ['tabular-nums'],
                letterSpacings: theme.letterSpacings.tight,
              }}
            >
              {formatTime()}
              <Text style={{ fontSize: 48, color: theme.colors.textSecondary }}>
                {formatMilliseconds()}
              </Text>
            </Text>
          </View>

          {/* Note & Mood Section */}
          {state === 'waiting' && (
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
          )}

          <Button
            size="lg"
            variant={getButtonVariant()}
            onPress={state === 'waiting' ? handleStart : handleStop}
            loading={loading}
            disabled={loading || state === 'cooldown'}
            fullWidth
          >
            {getButtonText()}
          </Button>

          {state === 'capturing' && (
            <Text variant="caption" color="secondary" align="center">
              Timer is running... Press stop when ready
            </Text>
          )}

          {state === 'waiting' && (
            <Text variant="caption" color="secondary" align="center">
              Press start to begin tracking time
            </Text>
          )}
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
  },
  statItem: {
    alignItems: 'center',
  },
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  noteSection: {
    width: '100%',
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
  },
});
