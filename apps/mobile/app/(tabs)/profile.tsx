import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { Container, Text, Card, Button, Input, Loading } from '@timetwin/ui';
import { useTheme } from '@timetwin/theme';
import { useAuth } from '../../src/contexts/AuthContext';
import {
  getMyProfile,
  updateMyProfile,
  getMyCaptureCount,
  getMyStreak,
  type Profile,
} from '@timetwin/api-sdk';

export default function ProfileScreen() {
  const { theme } = useTheme();
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [totalCaptures, setTotalCaptures] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const [profileResult, captureCountResult, streakResult] = await Promise.all([
        getMyProfile(),
        getMyCaptureCount(),
        getMyStreak(),
      ]);

      if (profileResult.data) {
        setProfile(profileResult.data);
        setUsername(profileResult.data.username || '');
        setIsPublic(profileResult.data.is_public);
      }

      if (captureCountResult.count !== null) {
        setTotalCaptures(captureCountResult.count);
      }

      if (streakResult.streak !== null) {
        setCurrentStreak(streakResult.streak);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await updateMyProfile({
        username: username || null,
        is_public: isPublic,
      });

      if (error) {
        Alert.alert('Error', error.message || 'Failed to update profile');
        return;
      }

      Alert.alert('Success', 'Profile updated successfully');
      setEditing(false);
      loadProfile();
    } catch (error) {
      console.error('Failed to update profile:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
            router.replace('/(auth)/login');
          } catch {
            Alert.alert('Error', 'Failed to sign out');
          }
        },
      },
    ]);
  };

  if (loading) {
    return <Loading fullScreen text="Loading profile..." />;
  }

  return (
    <Container padding={0}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing[4] }}>
        <View style={[styles.header, { marginBottom: theme.spacing[6] }]}>
          <Text variant="h2" align="center">
            Profile
          </Text>
        </View>

        {/* Stats Card */}
        <Card variant="elevated" padding={6} style={{ marginBottom: theme.spacing[4] }}>
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
            <View style={styles.statItem}>
              <Text variant="h3" align="center">
                {profile?.timezone || 'Unknown'}
              </Text>
              <Text variant="caption" color="secondary" align="center">
                Timezone
              </Text>
            </View>
          </View>
        </Card>

        {/* Profile Info Card */}
        <Card variant="outlined" padding={6} style={{ marginBottom: theme.spacing[4] }}>
          <Text variant="h4" style={{ marginBottom: theme.spacing[4] }}>
            Account Information
          </Text>

          <View style={[styles.form, { gap: theme.spacing[4] }]}>
            <View>
              <Text variant="label" style={{ marginBottom: theme.spacing[1] }}>
                Email
              </Text>
              <Text variant="body" color="secondary">
                {user?.email}
              </Text>
            </View>

            {editing ? (
              <>
                <Input
                  label="Username"
                  placeholder="Enter username"
                  value={username}
                  onChangeText={setUsername}
                />

                <View>
                  <Text variant="label" style={{ marginBottom: theme.spacing[2] }}>
                    Profile Visibility
                  </Text>
                  <View style={[styles.visibilityButtons, { gap: theme.spacing[2] }]}>
                    <Button
                      variant={isPublic ? 'primary' : 'outline'}
                      onPress={() => setIsPublic(true)}
                      style={{ flex: 1 }}
                    >
                      Public
                    </Button>
                    <Button
                      variant={!isPublic ? 'primary' : 'outline'}
                      onPress={() => setIsPublic(false)}
                      style={{ flex: 1 }}
                    >
                      Private
                    </Button>
                  </View>
                </View>

                <View style={[styles.actionButtons, { gap: theme.spacing[2] }]}>
                  <Button
                    variant="outline"
                    onPress={() => {
                      setEditing(false);
                      setUsername(profile?.username || '');
                      setIsPublic(profile?.is_public || true);
                    }}
                    disabled={saving}
                    style={{ flex: 1 }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onPress={handleSave}
                    loading={saving}
                    disabled={saving}
                    style={{ flex: 1 }}
                  >
                    Save
                  </Button>
                </View>
              </>
            ) : (
              <>
                <View>
                  <Text variant="label" style={{ marginBottom: theme.spacing[1] }}>
                    Username
                  </Text>
                  <Text variant="body" color="secondary">
                    {profile?.username || 'Not set'}
                  </Text>
                </View>

                <View>
                  <Text variant="label" style={{ marginBottom: theme.spacing[1] }}>
                    Profile Visibility
                  </Text>
                  <Text variant="body" color="secondary">
                    {profile?.is_public ? 'Public' : 'Private'}
                  </Text>
                </View>

                <Button variant="outline" onPress={() => setEditing(true)} fullWidth>
                  Edit Profile
                </Button>
              </>
            )}
          </View>
        </Card>

        {/* Actions */}
        <Button variant="outline" onPress={handleSignOut} fullWidth>
          Sign Out
        </Button>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  form: {
    width: '100%',
  },
  visibilityButtons: {
    flexDirection: 'row',
  },
  actionButtons: {
    flexDirection: 'row',
  },
});
