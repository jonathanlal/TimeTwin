import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Container, Text, Button, Input, Card, Loading } from '@timetwin/ui';
import { useTheme } from '@timetwin/theme';
import { getCaptureById, updateCapture, type Capture, type CaptureMood } from '@timetwin/api-sdk';

const MOOD_OPTIONS: { value: CaptureMood; emoji: string }[] = [
  { value: 'excited', emoji: '🤩' },
  { value: 'happy', emoji: '🙂' },
  { value: 'neutral', emoji: '😐' },
  { value: 'sad', emoji: '😢' },
  { value: 'angry', emoji: '😠' },
  { value: 'love', emoji: '😍' },
];

export default function EditCaptureScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useTheme();

  const [capture, setCapture] = useState<Capture | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState('');
  const [mood, setMood] = useState<CaptureMood | null>(null);

  useEffect(() => {
    if (id) {
      loadCapture();
    }
  }, [id]);

  const loadCapture = async () => {
    try {
      const { data, error } = await getCaptureById(String(id));
      if (error) {
        Alert.alert('Error', 'Failed to load capture');
        router.back();
        return;
      }
      if (data) {
        setCapture(data);
        setNote(data.note || '');
        setMood(data.mood as CaptureMood);
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to load capture');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    try {
      const { error } = await updateCapture(String(id), {
        note: note.trim() || null,
        mood: mood || null,
      });

      if (error) {
        Alert.alert('Error', error.message || 'Failed to update capture');
        return;
      }

      Alert.alert('Success', 'Capture updated', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading fullScreen text="Loading capture..." />;
  }

  return (
    <Container padding={0}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={{ position: 'absolute', top: 50, left: 20, zIndex: 10 }}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          style={{ width: 40, height: 40, justifyContent: 'center' }}
        >
          <Text style={{ fontSize: 32, color: theme.colors.text }}>←</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{ padding: theme.spacing[4], paddingTop: 80 }}>
        <View style={{ marginBottom: theme.spacing[6] }}>
          <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'baseline' }}>
             <Text variant="h1" align="center" style={{ fontSize: 40, lineHeight: 48 }}>
               {capture?.server_ts ? new Date(capture.server_ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
             </Text>
             <Text variant="h1" align="center" style={{ fontSize: 40, lineHeight: 48, color: theme.colors.textSecondary }}>
               {capture?.server_ts ? ':' + new Date(capture.server_ts).getSeconds().toString().padStart(2, '0') : ''} 
             </Text>
          </View>
          <Text variant="body" color="secondary" align="center" style={{ marginTop: 8 }}>
             {capture?.server_ts ? new Date(capture.server_ts).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' }) : ''}
          </Text>
        </View>

        <Card variant="elevated" padding={6} style={{ gap: theme.spacing[6] }}>
          {/* Note Input */}
          <Input
            label="Note"
            placeholder="Add a note..."
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={3}
            maxLength={200}
          />

          {/* Mood Selection */}
          <View style={{ gap: theme.spacing[2] }}>
            <Text variant="label">Vibe</Text>
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
                        backgroundColor: isSelected ? theme.colors.primary + '20' : theme.colors.surface,
                        borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                        borderWidth: 2,
                        aspectRatio: 1, 
                        padding: 0,
                      },
                    ]}
                  >
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                         <Text 
                           allowFontScaling={false}
                           style={{ 
                             fontSize: 30, 
                             textAlign: 'center',
                             lineHeight: 38,
                           }}
                         >
                           {option.emoji}
                         </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Actions */}
          <View style={{ flexDirection: 'row', gap: theme.spacing[2], marginTop: theme.spacing[4] }}>
            <Button
              variant="outline"
              onPress={() => router.back()}
              style={{ flex: 1 }}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onPress={handleSave}
              style={{ flex: 1 }}
              loading={saving}
            >
              Save
            </Button>
          </View>
        </Card>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'space-between', 
  },
  moodButton: {
    width: '30%', // 3 per row approx
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
