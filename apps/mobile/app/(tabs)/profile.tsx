import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert, Image, TouchableOpacity, Modal, FlatList, SafeAreaView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { Container, Text, Card, Button, Input, Loading } from '@timetwin/ui';
import { useTheme, useColorScheme } from '@timetwin/theme';
import { useAuth } from '../../src/contexts/AuthContext';
import {
  getMyProfile,
  updateMyProfile,
  getMyCaptureCount,
  getMyStreak,
  getSupabase,
  getAllCountries,
  type Profile,
  type Country,
} from '@timetwin/api-sdk';

export default function ProfileScreen() {
  const { theme } = useTheme();
  const { colorScheme, setColorScheme } = useColorScheme();
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [totalCaptures, setTotalCaptures] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  const [countries, setCountries] = useState<Country[]>([]);
  const [countryCode, setCountryCode] = useState<string | null>(null);
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  useEffect(() => {
    loadProfile();
    loadCountries();
  }, []);

  const loadCountries = async () => {
    try {
      const { data, error } = await getAllCountries();
      if (error) {
         console.log('Error loading countries:', error);
      } else if (data) {
        setCountries(data);
      }
    } catch (e) {
      console.log('Exception loading countries:', e);
    }
  };

  const loadProfile = async () => {
    try {
      const [profileResult, captureCountResult, streakResult] = await Promise.all([
        getMyProfile(),
        getMyCaptureCount(),
        getMyStreak(),
      ]);

      if (profileResult.data) {
        let profileData = profileResult.data;
        
        // Resolve signed URL for avatar
        let avatarPath = profileData.avatar_url;
        
        // Fix: If URL is a public URL (legacy or incorrect), extract the path
        if (avatarPath && avatarPath.startsWith('http') && avatarPath.includes('/avatars/')) {
            const parts = avatarPath.split('/avatars/');
            if (parts.length > 1) {
                avatarPath = parts[1];
                console.log('Extracted path from public URL:', avatarPath);
            }
        }

        // If we have a path (either from DB or extracted), sign it
        if (avatarPath && !avatarPath.startsWith('http')) {
          console.log('Resolving avatar path:', avatarPath);
          try {
            const { data } = await getSupabase()
              .storage
              .from('avatars')
              .createSignedUrl(avatarPath, 3600);
            
            if (data?.signedUrl) {
              console.log('Got signed URL:', data.signedUrl);
              profileData = { ...profileData, avatar_url: data.signedUrl };
            } else {
              console.log('No signed URL returned:', data);
            }
          } catch (e) {
            console.log('Failed to sign avatar URL:', e);
            // Fallback: don't show avatar if signing fails
          }
        } else {
             console.log('Avatar URL is public or null:', profileData.avatar_url);
        }

        setProfile(profileData);
        setUsername(profileData.username || '');
        setIsPublic(profileData.is_public);
        setCountryCode(profileData.country_code || null);
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

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true, // Note: editing might convert GIFs to static images on some platforms
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        
        // 1. Check File Size (5MB limit)
        const MAX_SIZE = 5 * 1024 * 1024; 
        if (asset.fileSize && asset.fileSize > MAX_SIZE) {
          Alert.alert('File too large', 'Please select an image under 5MB.');
          return;
        }

        // 2. Check File Type
        // Note: mimeType can be null on some platforms, falling back to extension check if needed
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (asset.mimeType && !allowedTypes.includes(asset.mimeType)) {
             Alert.alert('Invalid file type', 'Only JPEG, PNG, GIF, and WebP are allowed.');
             return;
        }

        uploadAvatar(asset);
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const uploadAvatar = async (asset: ImagePicker.ImagePickerAsset) => {
    if (!user) return;
    setUploading(true);
    try {
      const supabase = getSupabase();
      
      const response = await fetch(asset.uri);
      const arrayBuffer = await response.arrayBuffer();
      
      const fileExt = asset.uri.split('.').pop()?.toLowerCase() || 'jpeg';
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, arrayBuffer, {
          contentType: asset.mimeType || 'image/jpeg',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Store the path, not the public URL, for security
      const { error: updateError } = await updateMyProfile({
        avatar_url: filePath,
      });

      if (updateError) throw updateError;
      
      loadProfile();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to upload image. Storage may not be configured.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await updateMyProfile({
        username: username || null,
        is_public: isPublic,
        country_code: countryCode, 
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

  const currentCountryName = countries.find(c => c.code === countryCode)?.name || countryCode || 'Not set';

  if (loading) {
    return <Loading fullScreen text="Loading profile..." />;
  }

  return (
    <Container padding={0}>
      <ScrollView contentContainerStyle={{ padding: theme.spacing[4] }}>
        <View style={[styles.header, { marginBottom: theme.spacing[6], paddingTop: 60 }]}>
          <TouchableOpacity onPress={pickImage} disabled={uploading}>
             <View style={[styles.avatarContainer, { borderColor: theme.colors.primary }]}>
                {profile?.avatar_url ? (
                  <Image 
                    source={{ uri: profile.avatar_url }} 
                    style={styles.avatar} 
                    onError={(e) => console.log('Avatar load error:', e.nativeEvent.error)}
                  />
                ) : (
                  <Text style={{ fontSize: 40 }}>👤</Text>
                )}
                {uploading && (
                  <View style={styles.uploadingOverlay}>
                    <Loading />
                  </View>
                )}
             </View>
             <Text variant="caption" color="primary" align="center" style={{ marginTop: 8 }}>
               {uploading ? 'Uploading...' : 'Change Photo'}
             </Text>
          </TouchableOpacity>
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
                    Country
                  </Text>
                  <TouchableOpacity
                    onPress={() => setShowCountryPicker(true)}
                    style={{
                      padding: 12,
                      borderWidth: 1,
                      borderColor: theme.colors.border,
                      borderRadius: 8,
                      backgroundColor: theme.colors.surface,
                    }}
                  >
                    <Text variant="body">
                      {countryCode ? `${getFlagEmoji(countryCode)} ${currentCountryName}` : 'Select Country'}
                    </Text>
                  </TouchableOpacity>
                </View>

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
                      setCountryCode(profile?.country_code || null);
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
                    Country
                  </Text>
                  <Text variant="body" color="secondary">
                    {countryCode ? `${getFlagEmoji(countryCode)} ${currentCountryName}` : 'Not set'}
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

        {/* Appearance Settings */}
        <Card variant="outlined" padding={6} style={{ marginBottom: theme.spacing[4] }}>
          <Text variant="h4" style={{ marginBottom: theme.spacing[4] }}>
            Appearance
          </Text>
          <View style={[styles.visibilityButtons, { gap: theme.spacing[2] }]}>
            <Button
              variant={colorScheme === 'light' ? 'primary' : 'outline'}
              onPress={() => setColorScheme('light')}
              style={{ flex: 1 }}
            >
              Light
            </Button>
            <Button
              variant={colorScheme === 'dark' ? 'primary' : 'outline'}
              onPress={() => setColorScheme('dark')}
              style={{ flex: 1 }}
            >
              Dark
            </Button>
            <Button
              variant={colorScheme === 'auto' ? 'primary' : 'outline'}
              onPress={() => setColorScheme('auto')}
              style={{ flex: 1 }}
            >
              System
            </Button>
          </View>
        </Card>

        {/* Actions */}
        <Button variant="outline" onPress={handleSignOut} fullWidth>
          Sign Out
        </Button>
      </ScrollView>

      {/* Country Picker Modal */}
      <Modal visible={showCountryPicker} animationType="slide">
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: theme.colors.border }}>
                <Text variant="h3" style={{ flex: 1 }}>Select Country</Text>
                <TouchableOpacity onPress={() => setShowCountryPicker(false)}>
                    <Text variant="body" color="primary">Close</Text>
                </TouchableOpacity>
            </View>
            <FlatList
                data={countries}
                keyExtractor={(item) => item.code}
                renderItem={({ item }) => (
                    <TouchableOpacity 
                        style={{ padding: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.colors.border }}
                        onPress={() => {
                            setCountryCode(item.code);
                            setShowCountryPicker(false);
                        }}
                    >
                        <Text variant="body">{getFlagEmoji(item.code)} {item.name}</Text>
                    </TouchableOpacity>
                )}
            />
        </SafeAreaView>
      </Modal>
    </Container>
  );
}

function getFlagEmoji(countryCode: string) {
  if (!countryCode) return '';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
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
