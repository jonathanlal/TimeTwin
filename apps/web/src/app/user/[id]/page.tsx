'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Timer as TimerIcon, User as UserIcon, ArrowLeft, UserPlus, UserCheck, Clock } from 'lucide-react'
import {
  getUserPublicProfile,
  getPublicUserCaptures,
  getUserCaptureCount,
  getUserStreak,
  sendFriendRequest,
  respondToFriendRequest,
  type PublicProfile,
  type Capture,
} from '@timetwin/api-sdk'
import { MainNav } from '@/components/MainNav'

export default function UserProfilePage() {
  const router = useRouter()
  const params = useParams()
  const userId = params.id as string
  const { user: currentUser, initialized } = useAuth()
  
  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [captures, setCaptures] = useState<Capture[]>([])
  const [totalCaptures, setTotalCaptures] = useState<number>(0)
  const [streak, setStreak] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (initialized && !currentUser) {
      router.push('/login')
    }
  }, [initialized, currentUser, router])

  useEffect(() => {
    if (initialized && currentUser && userId) {
      loadProfile()
    }
  }, [initialized, currentUser, userId])

  const loadProfile = async () => {
    setLoading(true)
    try {
      // 1. Get Profile with Friendship Status
      const { data: profileData, error: profileError } = await getUserPublicProfile(userId)
      
      if (profileError || !profileData) {
        setError('User not found')
        return
      }
      setProfile(profileData)

      // 2. Get Stats & Captures in parallel
      const [capturesRes, countRes, streakRes] = await Promise.all([
          getPublicUserCaptures(userId, 10),
          getUserCaptureCount(userId),
          getUserStreak(userId)
      ])

      if (capturesRes.data) {
        // Cast partial to Capture if needed, or handle partial
        // getPublicUserCaptures returns Partial<Capture>[] with specific fields
        setCaptures(capturesRes.data as Capture[]) 
      }
      if (countRes.count !== null) setTotalCaptures(countRes.count)
      if (streakRes.streak !== null) setStreak(streakRes.streak)

    } catch (e) {
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleFriendAction = async () => {
    if (!profile) return
    setActionLoading(true)
    try {
      if (profile.friendship_status === 'none') {
        const { success } = await sendFriendRequest(userId)
        if (success) loadProfile()
      } else if (profile.friendship_status === 'pending_received') {
        router.push('/friends')
      }
    } catch (e) {
      console.error(e)
    } finally {
      setActionLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!initialized || !currentUser) return null

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <TimerIcon className="h-6 w-6" />
            <h1 className="text-2xl font-bold">TimeTwin</h1>
          </Link>
          <MainNav />
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/friends">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Friends
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        ) : error ? (
           <Card>
            <CardContent className="py-12 text-center">
              <p className="text-destructive mb-4">{error}</p>
              <Button asChild><Link href="/friends">Go Back</Link></Button>
            </CardContent>
          </Card>
        ) : profile ? (
          <div className="space-y-6">
            {/* Profile Card */}
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row items-center gap-6">
                  {/* Avatar */}
                  <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border-2 border-primary/20">
                     {profile.avatar_url ? (
                        <img src={profile.avatar_url} alt={profile.username || ''} className="h-full w-full object-cover"/>
                     ) : <UserIcon className="h-10 w-10 text-primary" />}
                  </div>
                  
                  <div className="flex-1 text-center md:text-left">
                    <CardTitle className="text-3xl mb-1">
                      {profile.username || 'Anonymous'}
                    </CardTitle>
                    <CardDescription className="text-lg">
                      {profile.country_code ? `${getFlagEmoji(profile.country_code)} ` : ''}
                      {profile.country_code || 'Unknown Location'}
                    </CardDescription>
                  </div>

                  {/* Action Button */}
                  {currentUser.id !== userId && (
                    <div className="mt-4 md:mt-0">
                        {profile.friendship_status === 'none' && (
                             <Button onClick={handleFriendAction} disabled={actionLoading} variant="primary">
                                <UserPlus className="mr-2 h-4 w-4" /> Add Friend
                             </Button>
                        )}
                        {profile.friendship_status === 'pending_sent' && (
                             <Button variant="secondary" disabled>
                                <Clock className="mr-2 h-4 w-4" /> Request Sent
                             </Button>
                        )}
                        {profile.friendship_status === 'pending_received' && (
                             <Button onClick={() => router.push('/friends')} variant="primary">
                                Respond to Request
                             </Button>
                        )}
                        {profile.friendship_status === 'accepted' && (
                             <Button variant="outline" className="text-green-600 border-green-200 bg-green-50 hover:bg-green-100">
                                <UserCheck className="mr-2 h-4 w-4" /> Friends
                             </Button>
                        )}
                    </div>
                  )}
                </div>
              </CardHeader>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
               <Card>
                 <CardContent className="py-6 text-center">
                    <p className="text-4xl font-bold">{totalCaptures}</p>
                    <p className="text-sm text-muted-foreground mt-1">Total Captures</p>
                 </CardContent>
               </Card>
               <Card>
                 <CardContent className="py-6 text-center">
                    <p className="text-4xl font-bold text-orange-500">{streak} 🔥</p>
                    <p className="text-sm text-muted-foreground mt-1">Day Streak</p>
                 </CardContent>
               </Card>
            </div>

            {/* Recent Captures */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Captures</CardTitle>
                <CardDescription>Latest public moments</CardDescription>
              </CardHeader>
              <CardContent>
                {captures.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    No public captures yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {captures.map((capture) => (
                      <div
                        key={capture.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/5 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                           <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                              <span className="text-xs font-bold font-mono">
                                {new Date(capture.server_ts).getHours()}:{new Date(capture.server_ts).getMinutes() < 10 ? '0' : ''}{new Date(capture.server_ts).getMinutes()}
                              </span>
                           </div>
                           <div>
                              <p className="font-medium text-sm">{capture.label_str}</p> 
                              <p className="text-xs text-muted-foreground">
                                {formatDate(capture.server_ts)}
                              </p>
                           </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-primary">
                            {capture.diff_seconds?.toFixed(3)}s
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : null}
      </main>
    </div>
  )
}

function getFlagEmoji(countryCode: string) {
  if (!countryCode) return '';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}
