import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Alert, ActivityIndicator, RefreshControl, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Container, Text, Card, Button } from '@timetwin/ui';
import { useTheme } from '@timetwin/theme';
import { getUserPublicProfile, sendFriendRequest, respondToFriendRequest, getPublicUserCaptures, getUserCaptureCount, type PublicProfile, type Capture } from '@timetwin/api-sdk';

const PRESET_EMOJIS = {
  excited: '🤩',
  happy: '🙂',
  neutral: '😐',
  sad: '😢',
  angry: '😠',
  love: '😍',
};

function getFlagEmoji(countryCode?: string | null) {
  if (!countryCode) return '';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [captures, setCaptures] = useState<Partial<Capture>[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id) {
        loadData();
    }
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (!id) return;
      
      const [profileRes, capturesRes, countRes] = await Promise.all([
          getUserPublicProfile(id),
          getPublicUserCaptures(id, 20),
          getUserCaptureCount(id)
      ]);

      if (profileRes.data) setProfile(profileRes.data);
      else if (profileRes.error) Alert.alert('Error', profileRes.error.message);

      if (capturesRes.data) setCaptures(capturesRes.data);
      if (countRes.count !== null) setTotalCount(countRes.count);

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleFriendAction = async () => {
    if (!profile) return;
    setActionLoading(true);
    try {
      if (profile.friendship_status === 'none') {
        const { success, error } = await sendFriendRequest(profile.id);
        if (success) {
            setProfile({ ...profile, friendship_status: 'pending_sent' });
        } else {
            console.error('Add friend failed:', error);
            Alert.alert('Error', 'Could not send request: ' + (error?.message || 'Unknown error'));
        }
      } else if (profile.friendship_status === 'pending_received' && profile.friendship_id) {
        // Accept
        const { success, error } = await respondToFriendRequest(profile.friendship_id, true);
        if (success) {
             setProfile({ ...profile, friendship_status: 'accepted' });
        } else {
             Alert.alert('Error', 'Could not accept request');
        }
      }
    } catch (err) {
        console.error(err);
        Alert.alert('Error', 'Unexpected error');
    } finally {
      setActionLoading(false);
    }
  };

  const getActionButtonConfig = () => {
    switch (profile?.friendship_status) {
      case 'accepted': return { label: 'Friends', disabled: true, variant: 'outline' };
      case 'pending_sent': return { label: 'Request Sent', disabled: true, variant: 'outline' };
      case 'pending_received': return { label: 'Accept Request', disabled: false, variant: 'primary' };
      default: return { label: 'Add Friend', disabled: false, variant: 'primary' };
    }
  };

  if (loading && !profile) return <Container centered><ActivityIndicator /></Container>;
  if (!profile && !loading) return <Container centered><Text>User not found</Text></Container>;

  const btnConfig = getActionButtonConfig();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <Stack.Screen options={{ title: profile?.username || 'User Profile', headerBackTitle: 'Back' }} />
      <ScrollView 
         contentContainerStyle={{ padding: 20, alignItems: 'center' }}
         refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} />}
      >
        
        {/* Avatar */}
        <View style={{ 
            width: 100, height: 100, borderRadius: 50, 
            backgroundColor: theme.colors.surface, 
            justifyContent: 'center', alignItems: 'center',
            marginBottom: 16,
            borderWidth: 2, borderColor: theme.colors.primary,
            overflow: 'hidden'
        }}>
            {profile?.avatar_url ? (
                <Image 
                    source={{ uri: profile.avatar_url }} 
                    style={{ width: '100%', height: '100%' }}
                />
            ) : (
                <Text style={{ fontSize: 40 }}>👤</Text>
            )}
        </View>

        {/* Username + Flag */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Text variant="h1">{profile?.username}</Text>
            <Text style={{ fontSize: 24 }}>{getFlagEmoji(profile?.country_code)}</Text>
        </View>
        
        {/* Total Count */}
        <Text variant="h3" color="secondary" style={{ marginBottom: 20 }}>
            {totalCount} Total Captures
        </Text>

        {/* Friend Action */}
        <Button 
            size="lg" 
            onPress={handleFriendAction}
            loading={actionLoading}
            disabled={btnConfig.disabled}
            variant={btnConfig.variant as any}
            style={{ width: '100%', maxWidth: 300, marginBottom: 30 }}
        >
            {btnConfig.label}
        </Button>

        {/* Recent Captures List */}
        <View style={{ width: '100%' }}>
            <Text variant="label" style={{ marginBottom: 12 }}>Recent Activity</Text>
            
            {captures.length === 0 ? (
                <Card style={{ padding: 20, alignItems: 'center' }}>
                    <Text color="secondary">No public records found.</Text> 
                </Card>
            ) : (
                <View style={{ gap: 12 }}>
                    {captures.map(cap => (
                        <Card key={cap.id} style={{ padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <View>
                                <Text variant="h3" style={{ fontFamily: 'monospace' }}>
                                    {new Date(cap.server_ts!).getHours().toString().padStart(2,'0')}:
                                    {new Date(cap.server_ts!).getMinutes().toString().padStart(2,'0')}
                                </Text>
                                <Text variant="caption" color="secondary">{new Date(cap.server_ts!).toDateString()}</Text>
                            </View>
                            
                            {cap.mood && (
                                <Text style={{ fontSize: 24 }}>
                                    {PRESET_EMOJIS[cap.mood as keyof typeof PRESET_EMOJIS] || cap.mood}
                                </Text>
                            )}
                        </Card>
                    ))}
                </View>
            )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
