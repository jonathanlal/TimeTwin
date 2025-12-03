'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  getMyProfile,
  updateMyProfile,
  getMyCaptureCount,
  getMyStreak,
  signOut,
  type Profile,
} from '@timetwin/api-sdk'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Timer as TimerIcon, LogOut } from 'lucide-react'
import { MainNav } from '@/components/MainNav'
import {
  CapturePanelMode,
  emitCapturePanelModeChange,
} from '@/lib/capture-panel-events'

type PanelMode = CapturePanelMode

const PANEL_MODE_OPTIONS: PanelMode[] = ['expanded', 'collapsed', 'hidden']

const FALLBACK_TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Singapore',
  'Asia/Tokyo',
]

type IntlWithSupportedValues = typeof Intl & {
  supportedValuesOf?: (input: string) => string[]
}

const intlWithSupportedValues: IntlWithSupportedValues | undefined =
  typeof Intl !== 'undefined' ? (Intl as IntlWithSupportedValues) : undefined

const TIMEZONE_OPTIONS =
  intlWithSupportedValues?.supportedValuesOf?.('timeZone') ?? FALLBACK_TIMEZONES

const getProfileIsPublic = (profile?: Profile | null) =>
  profile ? (typeof profile.is_public === 'boolean' ? profile.is_public : profile.privacy !== 'private') : true

export default function ProfilePage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [totalCaptures, setTotalCaptures] = useState(0)
  const [currentStreak, setCurrentStreak] = useState(0)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [username, setUsername] = useState('')
  const [usernameEditing, setUsernameEditing] = useState(false)
  const [usernameDraft, setUsernameDraft] = useState('')
  const [usernameSaving, setUsernameSaving] = useState(false)

  const [isPublic, setIsPublic] = useState(true)
  const [pendingVisibility, setPendingVisibility] = useState<boolean | null>(null)
  const [visibilitySaving, setVisibilitySaving] = useState(false)

  const [timezone, setTimezone] = useState('UTC')
  const [pendingTimezone, setPendingTimezone] = useState<string | null>(null)
  const [timezoneSaving, setTimezoneSaving] = useState(false)

  const [panelMode, setPanelMode] = useState<PanelMode>('expanded')
  const [panelSaving, setPanelSaving] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [authLoading, user, router])

  useEffect(() => {
    if (user) {
      loadProfile()
    }
  }, [user])

  const loadProfile = async () => {
    try {
      const [profileResult, captureCountResult, streakResult] = await Promise.all([
        getMyProfile(),
        getMyCaptureCount(),
        getMyStreak(),
      ])

      const loadedProfile = profileResult.data
      if (loadedProfile) {
        setProfile(loadedProfile)
        const initialUsername = loadedProfile.username || ''
        setUsername(initialUsername)
        setUsernameDraft(initialUsername)
        const initialPublic = getProfileIsPublic(loadedProfile)
        setIsPublic(initialPublic)
        setTimezone(loadedProfile.timezone || 'UTC')
        setPanelMode((loadedProfile.capture_panel_mode as PanelMode) || 'expanded')
        setPendingTimezone(null)
        setPendingVisibility(null)
      }

      if (captureCountResult.count !== null) {
        setTotalCaptures(captureCountResult.count)
      }

      if (streakResult.streak !== null) {
        setCurrentStreak(streakResult.streak)
      }
    } catch (error) {
      console.error('Failed to load profile:', error)
      setMessage({ type: 'error', text: 'Failed to load profile' })
    } finally {
      setLoading(false)
    }
  }

  const applyProfileUpdate = (updates: Partial<Profile>) => {
    setProfile((prev) => (prev ? { ...prev, ...updates } : prev))
  }

  const handleUsernameSave = async () => {
    if (usernameDraft === username) {
      setUsernameEditing(false)
      return
    }
    setUsernameSaving(true)
    try {
      const { error } = await updateMyProfile({ username: usernameDraft || null })
      if (error) {
        setMessage({ type: 'error', text: error.message || 'Failed to update username' })
        return
      }
      setUsername(usernameDraft)
      applyProfileUpdate({ username: usernameDraft || null })
      setUsernameEditing(false)
      setMessage({ type: 'success', text: 'Username updated' })
    } catch (error) {
      console.error('Username update failed:', error)
      setMessage({ type: 'error', text: 'Unexpected error updating username' })
    } finally {
      setUsernameSaving(false)
    }
  }

  const visibilityValue = pendingVisibility ?? isPublic
  const visibilityChanged = pendingVisibility !== null && pendingVisibility !== isPublic

  const confirmVisibilityChange = async () => {
    if (pendingVisibility === null || pendingVisibility === isPublic) return
    setVisibilitySaving(true)
    try {
      const target = pendingVisibility
      const { error } = await updateMyProfile({ is_public: target })
      if (error) {
        setMessage({ type: 'error', text: error.message || 'Failed to update visibility' })
        return
      }
      setIsPublic(target)
      applyProfileUpdate({
        is_public: target,
        privacy: target ? 'public' : 'private',
      })
      setPendingVisibility(null)
      setMessage({ type: 'success', text: `Profile is now ${target ? 'public' : 'private'}` })
    } catch (error) {
      console.error('Visibility update failed:', error)
      setMessage({ type: 'error', text: 'Unexpected error updating visibility' })
    } finally {
      setVisibilitySaving(false)
    }
  }

  const timezoneValue = pendingTimezone ?? timezone
  const timezoneChanged = pendingTimezone !== null && pendingTimezone !== timezone

  const confirmTimezoneChange = async () => {
    if (!pendingTimezone || pendingTimezone === timezone) return
    setTimezoneSaving(true)
    try {
      const nextTz = pendingTimezone
      const { error } = await updateMyProfile({ timezone: nextTz })
      if (error) {
        setMessage({ type: 'error', text: error.message || 'Failed to update timezone' })
        return
      }
      setTimezone(nextTz)
      applyProfileUpdate({ timezone: nextTz })
      setPendingTimezone(null)
      setMessage({ type: 'success', text: `Timezone updated to ${nextTz}` })
    } catch (error) {
      console.error('Timezone update failed:', error)
      setMessage({ type: 'error', text: 'Unexpected error updating timezone' })
    } finally {
      setTimezoneSaving(false)
    }
  }

  const handlePanelModeChange = async (mode: PanelMode) => {
    if (mode === panelMode) return
    setPanelSaving(true)
    setPanelMode(mode)
    try {
      const { error } = await updateMyProfile({ capture_panel_mode: mode })
      if (error) {
        setPanelMode((profile?.capture_panel_mode as PanelMode) || 'expanded')
        setMessage({ type: 'error', text: error.message || 'Failed to update panel preference' })
        return
      }
      applyProfileUpdate({ capture_panel_mode: mode })
      emitCapturePanelModeChange(mode)
      setMessage({ type: 'success', text: 'Capture panel preference saved' })
    } catch (error) {
      console.error('Panel preference update failed:', error)
      setMessage({ type: 'error', text: 'Unexpected error updating panel preference' })
      setPanelMode((profile?.capture_panel_mode as PanelMode) || 'expanded')
    } finally {
      setPanelSaving(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
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
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <TimerIcon className="h-6 w-6" />
            <span className="font-bold text-xl">TimeTwin</span>
          </Link>
          <MainNav />
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="grid gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
              <CardDescription>Your current capture stats and timezone</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                <div className="text-center">
                  <p className="text-4xl font-bold">{totalCaptures}</p>
                  <p className="text-sm text-muted-foreground mt-1">Total Captures</p>
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-primary">{currentStreak} d</p>
                  <p className="text-sm text-muted-foreground mt-1">Day Streak</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-semibold">{timezone}</p>
                  <p className="text-sm text-muted-foreground mt-1">Timezone</p>
                </div>
              </div>
              {(totalCaptures === 0 || currentStreak === 0) && (
                <div className="mt-8 rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-6 text-center">
                  <p className="text-sm text-primary mb-3 font-medium">You're all set - now capture your first twin time.</p>
                  <p className="text-muted-foreground mb-4">
                    The moment you log a matching minute (like 11:11) your stats and streak come alive.
                  </p>
                  <Button asChild size="sm" variant="outline">
                    <Link href="/timer">Open the Timer</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage profile, timezone, and capture preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <section className="space-y-2">
                <Label>Username</Label>
                {usernameEditing ? (
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Input
                      value={usernameDraft}
                      onChange={(e) => setUsernameDraft(e.target.value)}
                      placeholder="Enter username"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={handleUsernameSave}
                        disabled={usernameSaving || usernameDraft === username}
                      >
                        {usernameSaving ? 'Saving...' : 'Save'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setUsernameDraft(username)
                          setUsernameEditing(false)
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">{username || 'Not set'}</p>
                    <Button variant="outline" size="sm" onClick={() => setUsernameEditing(true)}>
                      {username ? 'Change username' : 'Set username'}
                    </Button>
                  </div>
                )}
              </section>

              <section className="space-y-2">
                <Label>Timezone</Label>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <select
                    value={timezoneValue}
                    onChange={(e) => setPendingTimezone(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {TIMEZONE_OPTIONS.map((tz) => (
                      <option key={tz} value={tz}>
                        {tz}
                      </option>
                    ))}
                  </select>
                  {timezoneChanged && (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={confirmTimezoneChange} disabled={timezoneSaving}>
                        {timezoneSaving ? 'Saving...' : 'Confirm'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setPendingTimezone(null)}
                        disabled={timezoneSaving}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Used for reminders, streak tracking, and quick capture cues.
                </p>
              </section>

              <section className="space-y-2">
                <Label>Profile Visibility</Label>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={visibilityValue}
                    onClick={() => setPendingVisibility(!visibilityValue)}
                    className={cnSwitch(visibilityValue)}
                  >
                    <span className="sr-only">Toggle visibility</span>
                    <span
                      className={cnSwitchThumb(visibilityValue)}
                      aria-hidden="true"
                    />
                  </button>
                  <span className="text-sm text-muted-foreground">
                    {visibilityValue ? 'Visible on public leaderboards' : 'Hidden from leaderboards'}
                  </span>
                </div>
                {visibilityChanged && (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={confirmVisibilityChange} disabled={visibilitySaving}>
                      {visibilitySaving ? 'Saving...' : 'Confirm'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPendingVisibility(null)}
                      disabled={visibilitySaving}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </section>

              <section className="space-y-2">
                <Label>Quick Capture Panel</Label>
                <div className="flex flex-wrap gap-2">
                  {PANEL_MODE_OPTIONS.map((mode) => (
                    <label
                      key={mode}
                      className={cnPanel(mode === panelMode)}
                    >
                      <input
                        type="radio"
                        className="sr-only"
                        checked={panelMode === mode}
                        onChange={() => handlePanelModeChange(mode)}
                      />
                      <span className="text-sm font-medium">{mode}</span>
                    </label>
                  ))}
                </div>
                {panelSaving && <p className="text-xs text-muted-foreground">Saving preference...</p>}
              </section>

              <Button variant="destructive" onClick={handleSignOut} className="w-full">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>

              {message && (
                <div
                  className={cnMessage(message.type)}
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

function cnSwitch(active: boolean) {
  return [
    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
    active ? 'bg-primary' : 'bg-slate-600',
  ].join(' ')
}

function cnSwitchThumb(active: boolean) {
  return [
    'inline-block h-4 w-4 transform rounded-full bg-white transition',
    active ? 'translate-x-5' : 'translate-x-1',
  ].join(' ')
}

function cnPanel(active: boolean) {
  return [
    'cursor-pointer rounded-full border px-4 py-1 capitalize transition',
    active
      ? 'border-primary bg-primary/10 text-primary'
      : 'border-border text-muted-foreground hover:border-primary/60 hover:text-primary',
  ].join(' ')
}

function cnMessage(type: 'success' | 'error') {
  return [
    'text-sm text-center p-3 rounded-md',
    type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-destructive/10 text-destructive',
  ].join(' ')
}
