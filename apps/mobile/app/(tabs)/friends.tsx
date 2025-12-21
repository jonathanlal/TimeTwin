import React, { useState, useEffect } from 'react';
import { View, FlatList, TouchableOpacity, RefreshControl, StyleSheet, ActivityIndicator, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Text, Card, Input, Button } from '@timetwin/ui';
import { useTheme } from '@timetwin/theme';
import { getMyFriends, getFriendRequests, searchUsers, getNotifications, markNotificationRead, respondToFriendRequest, type PublicProfile, type FriendRequest, type Notification } from '@timetwin/api-sdk';
import { useAuth } from '../../src/contexts/AuthContext';

export default function FriendsScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'friends' | 'search'>('friends');
  
  // Data
  const [friends, setFriends] = useState<PublicProfile[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  const [searchResults, setSearchResults] = useState<PublicProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [friendsRes, requestsRes, notifsRes] = await Promise.all([
        getMyFriends(),
        getFriendRequests(),
        getNotifications(),
      ]);
      
      if (friendsRes.data) setFriends(friendsRes.data);
      if (requestsRes.data) setRequests(requestsRes.data);
      if (notifsRes.data) setNotifications(notifsRes.data);
      
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (text: string) => {
    setSearchQuery(text);
    if (text.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const { data } = await searchUsers(text);
      if (data) setSearchResults(data);
    } finally {
      setSearching(false);
    }
  };

  const handleOpenNotifications = async () => {
      setShowNotifications(true);
      // Mark all as read nicely? Or on dismiss?
      // For now, mark them as read when opening individual ones or just refresh.
      // We will mark them as read in the UI logic if needed, but keeping it simple for MVP.
  };

  const handleRespondToRequest = async (notif: Notification, accept: boolean) => {
      // Friendship ID is in data.friendship_id
      if (!notif.data?.friendship_id) return;
      try {
          const { success } = await respondToFriendRequest(notif.data.friendship_id, accept);
          if (success) {
              await markNotificationRead(notif.id);
              loadData();
          }
      } catch (e) {
          console.error(e);
      }
  };

  const renderFriend = ({ item }: { item: PublicProfile }) => (
    <TouchableOpacity onPress={() => router.push(`/user/${item.id}`)}>
      <Card style={styles.userCard}>
        <View style={styles.userInfo}>
           <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
             <Text style={{ fontSize: 18 }}>{item.avatar_url ? '🖼️' : '👤'}</Text>
           </View>
           <View>
             <Text variant="h3">{item.username}</Text>
             {item.country_code && <Text variant="caption">{item.country_code}</Text>}
           </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }} edges={['top']}>
      <View style={{ flex: 1, paddingHorizontal: 20 }}>
        
        {/* Header with Bell */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
            <Text variant="h1">Friends & Social</Text>
            <TouchableOpacity onPress={handleOpenNotifications} style={{ padding: 8, overflow: 'visible' }}>
                <Text style={{ fontSize: 26, lineHeight: 30 }}>🔔</Text>
                {unreadCount > 0 && (
                    <View style={{ 
                        position: 'absolute', top: 4, right: 4, 
                        backgroundColor: '#FF3B30', 
                        borderRadius: 10, width: 20, height: 20,
                        justifyContent: 'center', alignItems: 'center',
                        borderWidth: 2, borderColor: theme.colors.background
                    }}>
                        <Text style={{ 
                            color: 'white', 
                            fontSize: 10, 
                            fontWeight: 'bold', 
                            textAlign: 'center',
                            lineHeight: 12,
                            includeFontPadding: false 
                        }}>
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </Text>
                    </View>
                )}
            </TouchableOpacity>
        </View>
        
        {/* Tabs */}
        <View style={{ flexDirection: 'row', marginVertical: 16, gap: 10 }}>
            <Button 
                size="sm" 
                variant={activeTab === 'friends' ? 'primary' : 'outline'}
                onPress={() => setActiveTab('friends')}
            >
                My Friends
            </Button>
            <Button 
                size="sm" 
                variant={activeTab === 'search' ? 'primary' : 'outline'}
                onPress={() => setActiveTab('search')}
            >
                Find People
            </Button>
        </View>

        {activeTab === 'friends' ? (
           <View style={{ flex: 1 }}>
              {/* Requests Section */}
              {requests.length > 0 && (
                  <View style={{ marginBottom: 20 }}>
                     <Text variant="label" style={{ marginBottom: 8 }}>Friend Requests</Text>
                     {requests.map(req => (
                         <Card key={req.id} style={{ marginBottom: 8, padding: 12 }}>
                             <Text>New request from {req.user?.username || 'user'}!</Text>
                             <Button size="sm" onPress={() => router.push(`/user/${req.user_id}`)} style={{ marginTop: 8 }}>View Profile</Button>
                         </Card>
                     ))}
                  </View>
              )}
              
              <Text variant="label" style={{ marginBottom: 8 }}>My Friends ({friends.length})</Text>
              <FlatList
                 data={friends}
                 renderItem={renderFriend}
                 keyExtractor={item => item.id}
                 refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} />}
                 contentContainerStyle={{ paddingBottom: 20 }}
              />
           </View>
        ) : (
           <View style={{ flex: 1 }}>
              <Input
                 placeholder="Search username..."
                 value={searchQuery}
                 onChangeText={handleSearch}
              />
              {searching && <ActivityIndicator style={{ marginTop: 10 }} />}
              <FlatList
                 data={searchResults}
                 renderItem={renderFriend}
                 keyExtractor={item => item.id}
                 style={{ marginTop: 12 }}
                 contentContainerStyle={{ paddingBottom: 20 }}
              />
           </View>
        )}
      </View>

      {/* Notifications Modal */}
      <Modal visible={showNotifications} animationType="slide" presentationStyle="pageSheet">
          <View style={{ flex: 1, backgroundColor: theme.colors.background, padding: 20 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <Text variant="h2">Notifications</Text>
                  <Button variant="ghost" onPress={() => setShowNotifications(false)}>Close</Button>
              </View>
              <FlatList
                  data={notifications}
                  keyExtractor={item => item.id}
                  renderItem={({ item }) => (
                      <Card style={{ marginBottom: 10, padding: 16, borderLeftWidth: item.is_read ? 0 : 4, borderLeftColor: theme.colors.primary }}>
                          <Text variant="h3">{item.title}</Text>
                          <Text variant="body">{item.message}</Text>
                          <Text variant="caption" color="secondary" style={{ marginTop: 4 }}>{new Date(item.created_at).toLocaleString()}</Text>
                          
                          {item.type === 'friend_request' && item.data?.friendship_id && (
                              <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                                  <Button 
                                      size="sm" 
                                      variant="primary" 
                                      onPress={() => handleRespondToRequest(item, true)}
                                  >
                                      Accept
                                  </Button>
                                  <Button 
                                      size="sm" 
                                      variant="outline" 
                                      onPress={() => handleRespondToRequest(item, false)}
                                  >
                                      Reject
                                  </Button>
                                  <Button 
                                      size="sm" 
                                      variant="ghost" 
                                      onPress={() => {
                                          setShowNotifications(false);
                                          router.push(`/user/${item.data.sender_id}`);
                                      }}
                                  >
                                      Profile
                                  </Button>
                              </View>
                          )}
                      </Card>
                  )}
                  ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>No notifications</Text>}
              />
          </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  userCard: {
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center'
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  }
});
