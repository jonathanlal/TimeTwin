'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import {
  getMyProfile,
  updateMyProfile,
  getMyCaptureCount,
  signOut,
  type Profile,
} from '@timetwin/api-sdk'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Timer as TimerIcon, LogOut, Trophy, User as UserIcon, History as HistoryIcon } from 'lucide-react'

export default function ProfilePage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [totalCaptures, setTotalCaptures] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [username, setUsername] = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      loadProfile()
    }
  }, [user])

  const loadProfile = async () => {
    try {
      const [profileResult, captureCountResult] = await Promise.all([
        getMyProfile(),
        getMyCaptureCount(),
      ])

      if (profileResult.data) {
        setProfile(profileResult.data)
        setUsername(profileResult.data.username || '')
        setIsPublic(profileResult.data.is_public)
      }

      if (captureCountResult.count !== null) {
        setTotalCaptures(captureCountResult.count)
      }
    } catch (error) {
      console.error('Failed to load profile:', error)
      setMessage({ type: 'error', text: 'Failed to load profile' })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)

    try {
      const { error } = await updateMyProfile({
        username: username || null,
        is_public: isPublic,
      })

      if (error) {
        setMessage({ type: 'error', text: error.message || 'Failed to update profile' })
        return
      }

      setMessage({ type: 'success', text: 'Profile updated successfully' })
      setEditing(false)
      loadProfile()
    } catch (error) {
      console.error('Failed to update profile:', error)
      setMessage({ type: 'error', text: 'An unexpected error occurred' })
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const handleCancel = () => {
    setEditing(false)
    setUsername(profile?.username || '')
    setIsPublic(profile?.is_public || true)
    setMessage(null)
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <TimerIcon className="h-6 w-6" />
            <span className="font-bold text-xl">TimeTwin</span>
          </Link>
          <nav className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/timer">
                <TimerIcon className="h-4 w-4 mr-2" />
                Timer
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/history">
                <HistoryIcon className="h-4 w-4 mr-2" />
                History
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/leaderboard">
                <Trophy className="h-4 w-4 mr-2" />
                Leaderboard
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
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Profile</h1>
            <p className="text-muted-foreground">Manage your account settings</p>
          </div>

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
                  <p className="text-2xl font-semibold">{profile?.timezone || 'Unknown'}</p>
                  <p className="text-sm text-muted-foreground mt-1">Timezone</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>View and edit your profile details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Email</Label>
                <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
              </div>

              {editing ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      placeholder="Enter username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Profile Visibility</Label>
                    <div className="flex gap-2">
                      <Button
                        variant={isPublic ? 'default' : 'outline'}
                        onClick={() => setIsPublic(true)}
                        className="flex-1"
                        type="button"
                      >
                        Public
                      </Button>
                      <Button
                        variant={!isPublic ? 'default' : 'outline'}
                        onClick={() => setIsPublic(false)}
                        className="flex-1"
                        type="button"
                      >
                        Private
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {isPublic
                        ? 'Your profile will be visible on the leaderboard'
                        : 'Your profile will be hidden from the leaderboard'}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      disabled={saving}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={saving} className="flex-1">
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label>Username</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {profile?.username || 'Not set'}
                    </p>
                  </div>

                  <div>
                    <Label>Profile Visibility</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {profile?.is_public ? 'Public' : 'Private'}
                    </p>
                  </div>

                  <Button variant="outline" onClick={() => setEditing(true)} className="w-full">
                    Edit Profile
                  </Button>
                </>
              )}

              {message && (
                <div
                  className={`text-sm text-center p-3 rounded-md ${
                    message.type === 'success'
                      ? 'bg-green-500/10 text-green-500'
                      : 'bg-destructive/10 text-destructive'
                  }`}
                >
                  {message.text}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
