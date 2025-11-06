'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { recordCapture, getTodayStats, signOut } from '@timetwin/api-sdk'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Timer as TimerIcon, LogOut, Trophy, User } from 'lucide-react'

type CaptureState = 'waiting' | 'capturing' | 'cooldown'

export default function TimerPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [state, setState] = useState<CaptureState>('waiting')
  const [seconds, setSeconds] = useState(0)
  const [milliseconds, setMilliseconds] = useState(0)
  const [todayCount, setTodayCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(0)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  // Load today's stats
  useEffect(() => {
    if (user) {
      loadTodayStats()
    }
  }, [user])

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

  // Timer logic
  useEffect(() => {
    if (state === 'capturing') {
      startTimeRef.current = Date.now()

      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current
        setSeconds(Math.floor(elapsed / 1000))
        setMilliseconds(Math.floor((elapsed % 1000) / 10))
      }, 10) // Update every 10ms for smooth display

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [state])

  const handleStart = () => {
    setState('capturing')
    setSeconds(0)
    setMilliseconds(0)
    setMessage(null)
  }

  const handleStop = async () => {
    setState('cooldown')
    setLoading(true)
    setMessage(null)

    try {
      const { data, error } = await recordCapture()

      if (error) {
        setMessage({ type: 'error', text: error.message || 'Failed to record capture' })
        setState('waiting')
        setSeconds(0)
        setMilliseconds(0)
        return
      }

      if (data && data.success) {
        setMessage({ type: 'success', text: data.message })
      } else {
        setMessage({ type: 'error', text: data?.message || 'Capture recorded' })
      }

      setState('waiting')
      setSeconds(0)
      setMilliseconds(0)
      loadTodayStats()
    } catch (error) {
      console.error('Capture error:', error)
      setMessage({ type: 'error', text: 'An unexpected error occurred' })
      setState('waiting')
      setSeconds(0)
      setMilliseconds(0)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const formatTime = () => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const formatMilliseconds = () => {
    return `.${milliseconds.toString().padStart(2, '0')}`
  }

  const getButtonText = () => {
    switch (state) {
      case 'waiting':
        return 'Start Capture'
      case 'capturing':
        return 'Stop & Record'
      case 'cooldown':
        return 'Recording...'
      default:
        return 'Start'
    }
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
          <nav className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/leaderboard">
                <Trophy className="h-4 w-4 mr-2" />
                Leaderboard
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/profile">
                <User className="h-4 w-4 mr-2" />
                Profile
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

              {/* Timer Display */}
              <div className="text-center">
                <div className="text-8xl font-bold tabular-nums tracking-tight">
                  {formatTime()}
                  <span className="text-6xl text-muted-foreground">
                    {formatMilliseconds()}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <Button
                size="lg"
                variant={state === 'capturing' ? 'secondary' : 'default'}
                onClick={state === 'waiting' ? handleStart : handleStop}
                disabled={loading || state === 'cooldown'}
                className="w-full text-lg h-14"
              >
                {getButtonText()}
              </Button>

              {/* Status Messages */}
              {state === 'capturing' && (
                <p className="text-sm text-muted-foreground text-center">
                  Timer is running... Press stop when ready
                </p>
              )}

              {state === 'waiting' && !message && (
                <p className="text-sm text-muted-foreground text-center">
                  Press start to begin tracking time
                </p>
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

          <p className="text-sm text-muted-foreground text-center mt-4">
            Logged in as {user.email}
          </p>
        </div>
      </main>
    </div>
  )
}
