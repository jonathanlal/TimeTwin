'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Timer, User, Trophy, LogOut, History as HistoryIcon, Search, TrendingUp, Target, Clock, Heart } from 'lucide-react'
import { getMyAnalytics, signOut, type AnalyticsData } from '@timetwin/api-sdk'

export default function InsightsPage() {
  const router = useRouter()
  const { user, initialized } = useAuth()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (initialized && !user) {
      router.push('/login')
    }
  }, [initialized, user, router])

  useEffect(() => {
    if (initialized && user) {
      loadAnalytics()
    }
  }, [initialized, user])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      const { data, error } = await getMyAnalytics()

      if (error) {
        setError('Failed to load analytics')
        return
      }

      if (data) {
        setAnalytics(data)
      }
    } catch {
      setError('Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const getAccuracyColor = (seconds: number) => {
    if (seconds <= 3) return 'text-green-500'
    if (seconds <= 10) return 'text-yellow-500'
    return 'text-muted-foreground'
  }

  const getMoodEmoji = (mood: string) => {
    const emojis: Record<string, string> = {
      excited: '✨',
      happy: '😊',
      neutral: '😐',
      thoughtful: '🤔',
      grateful: '💗',
      hopeful: '⭐',
    }
    return emojis[mood] || '•'
  }

  if (!initialized || !user) {
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
            <Timer className="h-6 w-6" />
            <h1 className="text-2xl font-bold">TimeTwin</h1>
          </Link>
          <nav className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/timer">
                <Timer className="h-4 w-4 mr-2" />
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
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold mb-2">Your Insights</h2>
            <p className="text-muted-foreground">
              Analytics and statistics about your time captures
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading analytics...</p>
            </div>
          ) : error ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-destructive">{error}</p>
                <Button onClick={loadAnalytics} className="mt-4">
                  Try Again
                </Button>
              </CardContent>
            </Card>
          ) : analytics ? (
            <div className="space-y-6">
              {/* Accuracy Stats */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    <CardTitle>Accuracy Statistics</CardTitle>
                  </div>
                  <CardDescription>How precise are your captures?</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <p className={`text-3xl font-bold ${getAccuracyColor(analytics.accuracy_stats.avg_accuracy)}`}>
                        {analytics.accuracy_stats.avg_accuracy}s
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">Average Accuracy</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-green-500">
                        {analytics.accuracy_stats.best_accuracy}s
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">Best Capture</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-green-500">
                        {analytics.accuracy_stats.perfect_captures}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">Perfect (≤3s)</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-yellow-500">
                        {analytics.accuracy_stats.great_captures}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">Great (4-10s)</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-muted-foreground">
                        {analytics.accuracy_stats.good_captures}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">Good (&gt;10s)</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold">
                        {analytics.accuracy_stats.total_captures}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">Total Captures</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Time Distribution */}
              {analytics.time_distribution.length > 0 && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      <CardTitle>Time Distribution</CardTitle>
                    </div>
                    <CardDescription>Which times do you capture most?</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analytics.time_distribution
                        .sort((a, b) => b.count - a.count)
                        .slice(0, 10)
                        .map((item) => {
                          const maxCount = Math.max(...analytics.time_distribution.map(d => d.count))
                          const percentage = (item.count / maxCount) * 100
                          return (
                            <div key={item.hour}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium">{item.hour}</span>
                                <span className="text-sm text-muted-foreground">{item.count} captures</span>
                              </div>
                              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary transition-all"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          )
                        })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Mood Distribution */}
              {analytics.mood_distribution.length > 0 && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Heart className="h-5 w-5 text-primary" />
                      <CardTitle>Mood Distribution</CardTitle>
                    </div>
                    <CardDescription>Your emotional patterns</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {analytics.mood_distribution.map((item) => (
                        <div key={item.mood} className="text-center p-4 border border-border rounded-lg">
                          <p className="text-4xl mb-2">{getMoodEmoji(item.mood)}</p>
                          <p className="font-semibold capitalize">{item.mood}</p>
                          <p className="text-2xl font-bold text-primary mt-2">{item.count}</p>
                          <p className="text-xs text-muted-foreground">captures</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recent Activity */}
              {analytics.recent_activity.length > 0 && (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      <CardTitle>Recent Activity</CardTitle>
                    </div>
                    <CardDescription>Your captures over the last 30 days</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {analytics.recent_activity.slice(0, 14).map((item) => {
                        const date = new Date(item.date)
                        const maxCount = Math.max(...analytics.recent_activity.map(d => d.count))
                        const percentage = (item.count / maxCount) * 100
                        return (
                          <div key={item.date}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium">
                                {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                              <span className="text-sm text-muted-foreground">{item.count} captures</span>
                            </div>
                            <div className="h-2 bg-secondary rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary transition-all"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No analytics data available yet.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Start capturing time to see your insights!
                </p>
                <Button asChild className="mt-4">
                  <Link href="/timer">Go to Timer</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
