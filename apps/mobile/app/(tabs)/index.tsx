import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, Modal, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Container, Text, Button, Card, Input } from '@timetwin/ui';
import { useTheme } from '@timetwin/theme';
import { recordCapture, updateCapture, getTodayStats, getSupabase, type CaptureMood } from '@timetwin/api-sdk';
import { useAuth } from '../../src/contexts/AuthContext';

const MOOD_OPTIONS: Array<{ value: CaptureMood; emoji: string }> = [
  { value: 'excited', emoji: '🤩' },
  { value: 'happy', emoji: '🙂' },
  { value: 'neutral', emoji: '😐' },
  { value: 'sad', emoji: '😢' },
  { value: 'angry', emoji: '😠' },
  { value: 'love', emoji: '😍' },
];

export default function TimerScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const router = useRouter();
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [todayCount, setTodayCount] = useState(0);
  
  // Capture State
  const [localWindowOpen, setLocalWindowOpen] = useState(false);
  const [showCaptureModal, setShowCaptureModal] = useState(false);
  const [currentCaptureId, setCurrentCaptureId] = useState<string | null>(null);
  const [creationStatus, setCreationStatus] = useState<'idle' | 'creating' | 'success' | 'error'>('idle');
  
  // Details Form
  const [note, setNote] = useState('');
  const [mood, setMood] = useState<CaptureMood | null>(null);
  const [updating, setUpdating] = useState(false);

  // Handle Deep Link Action
  useEffect(() => {
    if (params.action === 'capture') {
        // Clear the param to avoid re-triggering?
        // router.setParams({ action: null }); // Casting issue might arise
        // Just check if we are already handling it
        if (!showCaptureModal && creationStatus === 'idle') {
            console.log("Auto-capturing from deep link...");
            handleImmediateSave();
        }
    }
  }, [params.action]);

  // Load today's stats
  useEffect(() => {
    loadTodayStats();
  }, []);

  // Update current time every second
  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      setCurrentTime(now);
      const h = now.getHours();
      const m = now.getMinutes();
      setLocalWindowOpen(m === h || (m === h + 1 && now.getSeconds() <= 30));
    };
    checkTime();
    const interval = setInterval(checkTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadTodayStats = async () => {
    try {
      const { data } = await getTodayStats();
      if (data) setTodayCount(data.capture_count);
    } catch (error) {
      console.error('Failed to load today stats:', error);
    }
  };

  const handleImmediateSave = async () => {
    if (!user) return;
    
    // 1. Reset State & Open Modal Immediately
    setShowCaptureModal(true);
    setCreationStatus('creating');
    setCurrentCaptureId(null);
    setNote('');
    setMood(null);

    // Generate Twin ID (Local Time YYYYMMDDHHMM)
    const now = new Date();
    const twinId = `${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2,'0')}${now.getDate().toString().padStart(2,'0')}${now.getHours().toString().padStart(2,'0')}${now.getMinutes().toString().padStart(2,'0')}`;
    console.log('Capturing Twin ID:', twinId);

    try {
      // 2. Try Standard RPC
      const { data, error } = await recordCapture({}); // No details yet

      // If RPC Errors OR returns success=false (e.g. "Not Twin Time"), fail.
      if (error || (data && !data.success)) {
        console.warn("Capture failed:", error?.message || data?.message);
        setCreationStatus('error');
        Alert.alert("Not Twin Time", "You can only capture during a Twin Minute (e.g. 11:11)!");
        return;
      }

      // RPC Success (Strictly success=true)
      if (data && data.success) {
          // Identify the new record
          let newId: string | null = null;
          
          const supabase = getSupabase();
          // Ideally RPC returns ID. If not, fetch latest safety.
          const { data: latest } = await supabase
            .from('captures')
            .select('id, server_ts')
            .eq('user_id', user.id)
            .order('server_ts', { ascending: false })
            .limit(1)
            .single();
          
          const latestCapture = latest as any;
          if (latestCapture) {
              const diff = new Date().getTime() - new Date(latestCapture.server_ts).getTime();
              if (diff < 120000) {
                  newId = latestCapture.id;
              }
          }
          
          if (newId) {
             setCurrentCaptureId(newId);
             setCreationStatus('success');
             loadTodayStats();
             
             // Update the record with twin_id immediately
             // We do this silently in background
             updateCapture(newId, { twin_id: twinId }).catch(e => console.log('Failed to patch twin_id', e));
          } else {
             console.error("Could not verify new capture ID");
             setCreationStatus('error');
          }
      }
    } catch (error) {
      console.error('Capture error:', error);
      setCreationStatus('error');
    }
  };

  const handleUpdateDetails = async () => {
    if (!currentCaptureId) return;
    setUpdating(true);

    try {
      const { error } = await updateCapture(currentCaptureId, {
        note: note.trim() || null,
        mood: mood || null,
      });

      if (error) {
        Alert.alert('Error', 'Failed to update details. But your time was captured!');
      } else {
        // Success
        setShowCaptureModal(false);
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setUpdating(false);
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
          
          {/* Current Time Display */}
          <View style={styles.timerContainer}>
            <Text
              variant="h1"
              align="center"
              style={{
                fontSize: 80,
                lineHeight: 80,
                fontVariant: ['tabular-nums'],
                letterSpacing: -2,
                includeFontPadding: false,
              }}
            >
              {formatTime()}
            </Text>
            <Text variant="h3" color="secondary" style={{ marginTop: -8 }}>
              {formatSeconds()}
            </Text>
            
            <Text variant="body" color="secondary" align="center" style={{ marginTop: theme.spacing[4] }}>
              {localWindowOpen 
                ? "It's Twin Time!" 
                : 'Wait for the hour to match the minute...'}
            </Text>
          </View>

          {/* SAVE Button */}
          <Button
            size="lg"
            variant={localWindowOpen ? 'primary' : 'outline'}
            onPress={handleImmediateSave}
            fullWidth
            style={{ minHeight: 64 }} 
          >
            {localWindowOpen ? 'SAVE' : 'SAVE (DEV)'}
          </Button>
        </Card>
      </View>

      {/* Capture Details Modal */}
      <Modal visible={showCaptureModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <View style={{ flex: 1 }}>
                
                {/* Header */}
                <View style={{ padding: 20, borderBottomWidth: 1, borderBottomColor: theme.colors.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text variant="h3">
                        {creationStatus === 'creating' ? 'Saving...' : 
                         creationStatus === 'error' ? 'Error' : 'Captured!'}
                    </Text>
                    <TouchableOpacity onPress={() => setShowCaptureModal(false)}>
                        <Text color="primary" variant="body">Done</Text>
                    </TouchableOpacity>
                </View>
                
                {creationStatus === 'creating' && (
                    <View style={{ padding: 40, alignItems: 'center' }}>
                        <ActivityIndicator size="large" color={theme.colors.primary} />
                        <Text style={{ marginTop: 20 }}>Recording exact time...</Text>
                    </View>
                )}

                {creationStatus === 'error' && (
                    <View style={{ padding: 40, alignItems: 'center' }}>
                        <Text color="error" align="center">Failed to save capture.</Text>
                        <Button style={{ marginTop: 20 }} onPress={handleImmediateSave}>Retry</Button>
                    </View>
                )}

                {creationStatus === 'success' && (
                    <ScrollView contentContainerStyle={{ padding: 20, gap: 24 }}>
                        <View style={{ gap: 12 }}>
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
                                            ? theme.colors.primary + '20'
                                            : theme.colors.surface,
                                        borderColor: isSelected
                                            ? theme.colors.primary
                                            : theme.colors.border,
                                        borderWidth: 2,
                                        aspectRatio: 1, 
                                        padding: 0,
                                        },
                                    ]}
                                    >
                                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                        <Text style={{ fontSize: 36, lineHeight: 40 }}>{option.emoji}</Text>
                                    </View>
                                    </TouchableOpacity>
                                );
                                })}
                            </View>
                        </View>

                        <Input
                            label="Add a note (Optional)"
                            placeholder="What's happening?"
                            value={note}
                            onChangeText={setNote}
                            multiline
                            numberOfLines={4}
                            maxLength={200}
                        />

                        <Button 
                            size="lg" 
                            onPress={handleUpdateDetails} 
                            loading={updating}
                            disabled={updating}
                        >
                            SAVE DETAILS
                        </Button>
                    </ScrollView>
                )}
            </View>
        </SafeAreaView>
      </Modal>
    </Container>
  );
}

const styles = StyleSheet.create({
  content: {
    width: '100%',
    maxWidth: 500,
    paddingHorizontal: 20,
    flex: 1,
    justifyContent: 'center',
  },
  timerCard: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  timerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  moodButton: {
    width: '30%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
});
