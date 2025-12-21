'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Bell, User, Search, Check, X } from 'lucide-react'
import { MainNav } from '@/components/MainNav'
import {
  getMyFriends,
  getFriendRequests,
  searchUsers,
  getNotifications,
  markNotificationRead,
  respondToFriendRequest,
  type PublicProfile,
  type FriendRequest,
  type Notification,
} from '@timetwin/api-sdk'

export default function FriendsPage() {
  const router = useRouter()
  const { user, initialized } = useAuth()
  
  const [activeTab, setActiveTab] = useState<'friends' | 'search'>('friends')
  const [friends, setFriends] = useState<PublicProfile[]>([])
  const [requests, setRequests] = useState<FriendRequest[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [searchResults, setSearchResults] = useState<PublicProfile[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  useEffect(() => {
    if (initialized && !user) {
      router.push('/login')
    } else if (initialized && user) {
      loadData()
    }
  }, [initialized, user, router])

  const loadData = async () => {
    setLoading(true)
    try {
      const [friendsRes, requestsRes, notifsRes] = await Promise.all([
        getMyFriends(),
        getFriendRequests(),
        getNotifications(),
      ])

      if (friendsRes.data) setFriends(friendsRes.data)
      if (requestsRes.data) setRequests(requestsRes.data)
      if (notifsRes.data) setNotifications(notifsRes.data)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    setSearching(true)
    try {
      const { data } = await searchUsers(searchQuery)
      if (data) setSearchResults(data)
    } finally {
      setSearching(false)
    }
  }

  const handleRespond = async (friendshipId: string, accept: boolean) => {
    const { success } = await respondToFriendRequest(friendshipId, accept)
    if (success) {
      loadData() // Refresh lists
    }
  }
  
  const handleNotificationClick = async (notif: Notification) => {
      // Mark as read
      if (!notif.is_read) {
          await markNotificationRead(notif.id)
          // Update local state to reflect read status
           setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n))
      }
      
      // If friend request, maybe expand or navigate, but we have buttons in it now
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  if (!initialized || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold">TimeTwin</h1>
          </Link>
          <MainNav />
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Friends & Social</h2>
            
            {/* Notification Bell */}
            <div className="relative">
                <Button variant="ghost" size="icon" onClick={() => setShowNotifications(!showNotifications)}>
                    <Bell className="h-6 w-6" />
                    {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                            {unreadCount}
                        </span>
                    )}
                </Button>
                
                {showNotifications && (
                    <Card className="absolute right-0 top-12 w-80 z-50 shadow-xl">
                        <CardHeader className="py-3 bg-muted/50">
                            <CardTitle className="text-sm">Notifications</CardTitle>
                        </CardHeader>
                        <CardContent className="max-h-96 overflow-y-auto p-0">
                            {notifications.length === 0 ? (
                                <p className="text-center py-4 text-muted-foreground text-sm">No notifications</p>
                            ) : (
                                notifications.map(notif => (
                                    <div 
                                        key={notif.id} 
                                        className={`p-3 border-b border-border last:border-0 hover:bg-muted/50 transition-colors ${!notif.is_read ? 'bg-primary/5' : ''}`}
                                        onClick={() => handleNotificationClick(notif)}
                                    >
                                        <p className="font-semibold text-sm">{notif.title}</p>
                                        <p className="text-xs text-muted-foreground">{notif.message}</p>
                                        {notif.type === 'friend_request' && notif.data?.friendship_id && (
                                            <div className="flex gap-2 mt-2">
                                                <Button size="sm" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); handleRespond(notif.data.friendship_id, true) }}>Accept</Button>
                                                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); handleRespond(notif.data.friendship_id, false) }}>Decline</Button>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
            <Button 
                variant={activeTab === 'friends' ? 'primary' : 'outline'}
                onClick={() => setActiveTab('friends')}
            >
                My Friends
            </Button>
            <Button 
                variant={activeTab === 'search' ? 'primary' : 'outline'}
                onClick={() => setActiveTab('search')}
            >
                Find People
            </Button>
        </div>

        {activeTab === 'friends' ? (
            <div className="space-y-8">
                {requests.length > 0 && (
                    <Card className="border-primary/20 bg-primary/5">
                        <CardHeader>
                            <CardTitle className="text-lg">Friend Requests</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {requests.map(req => (
                                <div key={req.id} className="flex items-center justify-between bg-card p-3 rounded-md border">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            {req.user?.avatar_url ? (
                                                <img src={req.user.avatar_url} alt="" className="h-full w-full rounded-full object-cover"/>
                                            ) : <User className="h-6 w-6 text-primary" />}
                                        </div>
                                        <div>
                                            <p className="font-medium">{req.user?.username}</p>
                                            <p className="text-xs text-muted-foreground">Sent a request</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="sm" onClick={() => handleRespond(req.id, true)}>Accept</Button>
                                        <Button size="sm" variant="outline" onClick={() => handleRespond(req.id, false)}>Decline</Button>
                                        <Button size="sm" variant="ghost" asChild>
                                            <Link href={`/user/${req.user_id}`}>View</Link>
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {friends.map(friend => (
                        <Link key={friend.id} href={`/user/${friend.id}`}>
                            <Card className="hover:border-primary transition-colors cursor-pointer">
                                <CardContent className="p-4 flex items-center gap-4">
                                     <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                                        {friend.avatar_url ? (
                                            <img src={friend.avatar_url} alt="" className="h-full w-full object-cover"/>
                                        ) : <User className="h-6 w-6 text-primary" />}
                                    </div>
                                    <div>
                                        <p className="font-semibold">{friend.username}</p>
                                        <p className="text-sm text-muted-foreground">{friend.country_code || 'Earth'}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                    {friends.length === 0 && (
                        <div className="col-span-full text-center py-12 text-muted-foreground">
                            You haven't added any friends yet.
                        </div>
                    )}
                </div>
            </div>
        ) : (
            <div className="space-y-6">
                <form onSubmit={handleSearch} className="flex gap-2 max-w-md mx-auto">
                    <Input 
                        placeholder="Search username..." 
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                    <Button type="submit" disabled={searching}>
                        {searching ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Search className="h-4 w-4" />}
                    </Button>
                </form>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {searchResults.map(profile => (
                        <Link key={profile.id} href={`/user/${profile.id}`}>
                            <Card className="hover:border-primary transition-colors cursor-pointer">
                                <CardContent className="p-4 flex items-center justify-between">
                                     <div className="flex items-center gap-3">
                                         <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                                            {profile.avatar_url ? (
                                                <img src={profile.avatar_url} alt="" className="h-full w-full object-cover"/>
                                            ) : <User className="h-5 w-5 text-primary" />}
                                        </div>
                                        <div>
                                            <p className="font-medium">{profile.username}</p>
                                            <p className="text-xs text-muted-foreground">{profile.country_code}</p>
                                        </div>
                                     </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        )}

      </main>
    </div>
  )
}
