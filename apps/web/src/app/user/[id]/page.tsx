'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Timer as TimerIcon, User as UserIcon, Trophy, LogOut, History as HistoryIcon, ArrowLeft, Search } from 'lucide-react'
import {
  getProfile,
  getUserCaptureCount,
  getUserStreak,
  getUserCaptures,
  signOut,
  type Profile,
  type Capture,
} from '@timetwin/api-sdk'

export default function UserProfilePage() {
  const router = useRouter()
  const params = useParams()
  const userId = params.id as string
  const { user: currentUser, initialized } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [totalCaptures, setTotalCaptures] = useState(0)
  const [currentStreak, setCurrentStreak] = useState(0)
  const [recentCaptures, setRecentCaptures] = useState<Capture[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (initialized && !currentUser) {
      router.push('/login')
    }
  }, [initialized, currentUser, router])

  useEffect(() => {
    if (initialized && currentUser && userId) {
      loadUserProfile()
    }
  }, [initialized, currentUser, userId])

  const loadUserProfile = async () => {
    try {
      setLoading(true)

      const [profileResult, captureCountResult, streakResult, capturesResult] = await Promise.all([
        getProfile(userId),
        getUserCaptureCount(userId),
        getUserStreak(userId),
        getUserCaptures(userId, { limit: 5 }),
      ])

      if (profileResult.error || !profileResult.data) {
        setError('User not found or profile is private')
        return
      }

      if (!profileResult.data.is_public) {
        setError('This profile is private')
        return
      }

      setProfile(profileResult.data)

      if (captureCountResult.count !== null) {
        setTotalCaptures(captureCountResult.count)
      }

      if (streakResult.streak !== null) {
        setCurrentStreak(streakResult.streak)
      }

      if (capturesResult.data) {
        setRecentCaptures(capturesResult.data)
      }
    } catch {
      setError('Failed to load user profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
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

  if (!initialized || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <TimerIcon className="h-6 w-6" />
            <h1 className="text-2xl font-bold">TimeTwin</h1>
          </Link>
          <nav className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/timer">
                <TimerIcon className="h-4 w-4 mr-2" />
                Timer
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/search">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/leaderboard">
                <Trophy className="h-4 w-4 mr-2" />
                Leaderboard
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/profile">
                <UserIcon className="h-4 w-4 mr-2" />
                My Profile
              </Link>
            </Button>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/search">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Search
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
              <Button asChild>
                <Link href="/search">Go to Search</Link>
              </Button>
            </CardContent>
          </Card>
        ) : profile ? (
          <div className="space-y-6">
            {/* Profile Header */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <UserIcon className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl">
                      {profile.username || 'Anonymous'}
                    </CardTitle>
                    <CardDescription>
                      {profile.country_code && `${profile.country_code} • `}
                      {profile.timezone}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-8">
                  <div className="text-center">
                    <p className="text-4xl font-bold">{totalCaptures}</p>
                    <p className="text-sm text-muted-foreground mt-1">Total Captures</p>
                  </div>
                  <div className="text-center">
                    <p className="text-4xl font-bold text-primary">{currentStreak} 🔥</p>
                    <p className="text-sm text-muted-foreground mt-1">Day Streak</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Captures */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Captures</CardTitle>
                <CardDescription>Latest 5 time captures</CardDescription>
              </CardHeader>
              <CardContent>
                {recentCaptures.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    No recent captures
                  </p>
                ) : (
                  <div className="space-y-3">
                    {recentCaptures.map((capture) => (
                      <div
                        key={capture.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-border"
                      >
                        <div>
                          <p className="font-semibold">{capture.label_str}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(capture.server_ts)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {capture.diff_seconds}s
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
