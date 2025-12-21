import { getSupabase } from './client';
import type { PostgrestError } from '@supabase/supabase-js';

// Types
export interface FriendRequest {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  user?: { username: string; avatar_url: string }; // Sender details
  friend?: { username: string; avatar_url: string }; // Receiver details
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  data: any;
  is_read: boolean;
  created_at: string;
}

export interface PublicProfile {
  id: string;
  username: string;
  avatar_url: string | null;
  country_code: string | null;
  bio?: string;
  created_at: string;
  friendship_status?: 'none' | 'pending_sent' | 'pending_received' | 'accepted';
  friendship_id?: string;
}

export interface PublicCapture {
  id: string;
  server_ts: string;
  twin_id: string | null;
  mood: string | null;
  country_code?: string;
}

// --- Functions ---

/**
 * Search users by username
 */
export async function searchUsers(query: string): Promise<{ data: PublicProfile[] | null; error: PostgrestError | null }> {
  if (!query || query.length < 2) return { data: [], error: null };
  
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, avatar_url, country_code')
    .ilike('username', `%${query}%`)
    .limit(20);

  return { data: data as PublicProfile[], error };
}

/**
 * Get a user's public profile and checked friendship status
 */
export async function getUserPublicProfile(targetUserId: string): Promise<{ data: PublicProfile | null; error: PostgrestError | null }> {
  const supabase = getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  
  // 1. Get Profile
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('id, username, avatar_url, country_code')
    .eq('id', targetUserId)
    .single();
    
  if (error || !profile) return { data: null, error };

  // Resolve Signed URL if needed
  if (profile.avatar_url && !profile.avatar_url.startsWith('http')) {
      const { data: signedData } = await supabase.storage
          .from('avatars')
          .createSignedUrl(profile.avatar_url, 3600);
      
      if (signedData) {
          profile.avatar_url = signedData.signedUrl;
      }
  }

  let currentUserId = user?.id;
  let status: PublicProfile['friendship_status'] = 'none';
  let friendshipId: string | undefined;

  // 2. Check Friendship Status if logged in
  if (currentUserId && currentUserId !== targetUserId) {
    // Cast to any to avoid TS errors with unknown tables
    const { data: friendship } = await (supabase
      .from('friendships') as any)
      .select('id, user_id, friend_id, status')
      .or(`and(user_id.eq.${currentUserId},friend_id.eq.${targetUserId}),and(user_id.eq.${targetUserId},friend_id.eq.${currentUserId})`)
      .single();
      
    if (friendship) {
      if (friendship.status === 'accepted') {
        status = 'accepted';
      } else if (friendship.status === 'pending') {
         status = friendship.user_id === currentUserId ? 'pending_sent' : 'pending_received';
      }
      friendshipId = friendship.id;
    }
  }

  return { 
    data: { ...profile, friendship_status: status, friendship_id: friendshipId }, 
    error: null 
  };
}

/**
 * Send Friend Request
 */
export async function sendFriendRequest(targetUserId: string): Promise<{ success: boolean; error: PostgrestError | null }> {
  const supabase = getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: null };

  const { error } = await (supabase
    .from('friendships') as any)
    .insert({ user_id: user.id, friend_id: targetUserId, status: 'pending' });

  return { success: !error, error };
}

/**
 * Accept Friend Request
 */
export async function respondToFriendRequest(friendshipId: string, accept: boolean): Promise<{ success: boolean; error: PostgrestError | null }> {
  const supabase = getSupabase();
  
  if (!accept) {
     const { error } = await (supabase.from('friendships') as any).delete().eq('id', friendshipId);
     return { success: !error, error };
  }

  const { error } = await (supabase
    .from('friendships') as any)
    .update({ status: 'accepted' })
    .eq('id', friendshipId);

  return { success: !error, error };
}

/**
 * Get My Friends
 */
export async function getMyFriends(): Promise<{ data: PublicProfile[] | null; error: PostgrestError | null }> {
  const supabase = getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: null };
  
  // Find accepted friendships where I am user OR friend
  const { data: friendships, error } = await (supabase
    .from('friendships') as any)
    .select(`
      id,
      user_id,
      friend_id,
      user:profiles!friendships_user_id_fkey(id, username, avatar_url, country_code),
      friend:profiles!friendships_friend_id_fkey(id, username, avatar_url, country_code)
    `)
    .eq('status', 'accepted')
    .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`);
    
  if (error) return { data: null, error };

  // Map to a list of "The Other Person"
  const friends = friendships.map((f: any) => {
      const isMeSender = f.user_id === user.id;
      return isMeSender ? f.friend : f.user;
  });

  return { data: friends, error: null };
}

/**
 * Get Pending Requests (Received)
 */
export async function getFriendRequests(): Promise<{ data: FriendRequest[] | null; error: PostgrestError | null }> {
  const supabase = getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: null };

  const { data, error } = await (supabase
    .from('friendships') as any)
    .select(`
       *,
       user:profiles!friendships_user_id_fkey(username, avatar_url)
    `)
    .eq('friend_id', user.id)
    .eq('status', 'pending');

  return { data: data as any, error };
}

/**
 * Get Notifications
 */
export async function getNotifications(): Promise<{ data: Notification[] | null; error: PostgrestError | null }> {
    const supabase = getSupabase();
    const { data, error } = await (supabase
        .from('notifications') as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
    return { data, error };
}

export async function markNotificationRead(notifId: string): Promise<void> {
    const supabase = getSupabase();
    await (supabase.from('notifications') as any).update({ is_read: true }).eq('id', notifId);
}
