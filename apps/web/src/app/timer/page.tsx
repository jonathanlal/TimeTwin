'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { recordCapture, getTodayStats, isTwinTime, type CaptureMood } from '@timetwin/api-sdk'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Timer as TimerIcon, Sparkles, Smile, Meh, Brain, Heart, Star } from 'lucide-react'
import { MainNav } from '@/components/MainNav'
import { cn } from '@/lib/utils'

const MOOD_OPTIONS: Array<{ value: CaptureMood; label: string; icon: typeof Sparkles; color: string }> = [
  { value: 'excited', label: 'Excited', icon: Sparkles, color: 'text-yellow-500' },
  { value: 'happy', label: 'Happy', icon: Smile, color: 'text-green-500' },
  { value: 'neutral', label: 'Neutral', icon: Meh, color: 'text-gray-500' },
  { value: 'thoughtful', label: 'Thoughtful', icon: Brain, color: 'text-blue-500' },
  { value: 'grateful', label: 'Grateful', icon: Heart, color: 'text-pink-500' },
  { value: 'hopeful', label: 'Hopeful', icon: Star, color: 'text-purple-500' },
]

export default function TimerPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [todayCount, setTodayCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [note, setNote] = useState('')
  const [mood, setMood] = useState<CaptureMood | null>(null)
  const [serverWindowOpen, setServerWindowOpen] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  // Load today's stats
  useEffect(() => {
    if (user) {
      loadTodayStats()
    }
  }, [user])

  // Poll server twin-time window to keep UI truthful
  useEffect(() => {
    let mounted = true

    const checkWindow = async () => {
      try {
        const { open } = await isTwinTime()
        if (mounted) {
          setServerWindowOpen(open)
        }
      } catch (error) {
        console.error('Failed to check twin time window:', error)
      }
    }

    checkWindow()
    const interval = setInterval(checkWindow, 10000)
    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [])

  const loadTodayStats = async () => {
    try {
      const { data } = await getTodayStats()
      if (data) {
        setTodayCount(data.capture_count)
      }
    } catch (error) {
      console.error('Failed to load today stats:', error)
    }
  }

  const handleCapture = async () => {
    if (!serverWindowOpen) {
      setMessage({
        type: 'error',
        text: 'Server window closed. Wait until the hour matches the minute (e.g. 11:11).',
      })
      return
    }
    setLoading(true)
    setMessage(null)

    try {
      const { data, error } = await recordCapture({
        note: note.trim() || undefined,
        mood: mood || undefined,
      })

      if (error) {
        setMessage({ type: 'error', text: error.message || 'Failed to record capture' })
        return
      }

      if (data && data.success) {
        setMessage({ type: 'success', text: data.message })
      } else {
        setMessage({ type: 'error', text: data?.message || 'Capture recorded' })
      }

      setNote('')
      setMood(null)
      loadTodayStats()
    } catch (error) {
      console.error('Capture error:', error)
      setMessage({ type: 'error', text: 'An unexpected error occurred' })
    } finally {
      setLoading(false)
    }
  }

  const formatTime = () => {
    const hours = currentTime.getHours().toString().padStart(2, '0')
    const minutes = currentTime.getMinutes().toString().padStart(2, '0')
    const seconds = currentTime.getSeconds().toString().padStart(2, '0')
    return { hours, minutes, seconds }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
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
          <MainNav />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-center">Time Capture</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Today's Stats */}
              <div className="flex justify-center">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">Today</p>
                  <p className="text-4xl font-bold">{todayCount}</p>
                </div>
              </div>

              {/* Current Time Display */}
              <div className="text-center">
                <div className="text-9xl font-bold tabular-nums tracking-tight">
                  {formatTime().hours}:{formatTime().minutes}
                  <span className="text-6xl text-muted-foreground/50">
                    :{formatTime().seconds}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  When you see double digits, rush here and hit SAVE!
                </p>
              </div>

              {/* Note & Mood Section */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="note" className="text-sm">
                    Add a note (optional)
                  </Label>
                  <Input
                    id="note"
                    placeholder="What are you wishing for?"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    maxLength={200}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Tag your vibe (optional)</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {MOOD_OPTIONS.map((option) => {
                      const Icon = option.icon
                      const isSelected = mood === option.value
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setMood(isSelected ? null : option.value)}
                          className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all ${
                            isSelected
                              ? 'border-primary bg-primary/10'
                              : 'border-border bg-card hover:border-primary/50'
                          }`}
                        >
                          <Icon className={`h-5 w-5 ${isSelected ? 'text-primary' : option.color}`} />
                          <span className={`text-xs ${isSelected ? 'font-medium' : ''}`}>
                            {option.label}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <Button
                size="lg"
                onClick={handleCapture}
                disabled={loading || !serverWindowOpen}
                className={cn(
                  'w-full text-2xl h-20 border-2 font-bold disabled:cursor-not-allowed transition-all duration-300',
                  loading || !serverWindowOpen
                    ? 'border-red-500/40 text-red-300 bg-red-500/5'
                    : 'border-emerald-400 text-white shadow-[0_0_35px_rgba(16,185,129,0.35)] bg-gradient-to-r from-emerald-500 via-lime-400 to-emerald-500 animate-shimmer hover:shadow-[0_0_40px_rgba(16,185,129,0.55)]',
                )}
                title={
                  serverWindowOpen
                    ? 'Capture this moment!'
                    : 'Only available during twin time (e.g. 11:11, 23:23) based on server time'
                }
              >
                {loading ? 'SAVING...' : serverWindowOpen ? 'SAVE' : 'WAIT'}
              </Button>

              {/* Twin Time Message */}
              {!serverWindowOpen && !message && (
                <p className="text-sm text-center text-muted-foreground">
                  Button is only available during twin time (when hour equals minute, like 11:11 or 23:23)
                </p>
              )}

              {/* Status Messages */}
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

          {user?.email && (
            <p className="text-sm text-muted-foreground text-center mt-4">
              Logged in as {user.email}
            </p>
          )}
        </div>
      </main>
    </div>
  )
}
