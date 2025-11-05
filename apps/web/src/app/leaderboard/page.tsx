'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Timer, Trophy, Medal, Award } from 'lucide-react'
import { initSupabase, getGlobalLeaderboard, type LeaderboardEntry } from '@timetwin/api-sdk'

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      setError('Supabase configuration is missing')
      setLoading(false)
      return
    }

    try {
      initSupabase(supabaseUrl, supabaseAnonKey)
      loadLeaderboard()
    } catch (err) {
      setError('Failed to initialize')
      setLoading(false)
    }
  }, [])

  const loadLeaderboard = async () => {
    try {
      const { data, error } = await getGlobalLeaderboard({ limit: 50 })

      if (error) {
        setError(error.message)
        return
      }

      if (data) {
        setLeaderboard(data)
      }
    } catch (err) {
      setError('Failed to load leaderboard')
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-6 w-6 text-yellow-500" />
      case 1:
        return <Medal className="h-6 w-6 text-gray-400" />
      case 2:
        return <Award className="h-6 w-6 text-amber-700" />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Timer className="h-6 w-6" />
            <h1 className="text-2xl font-bold">TimeTwin</h1>
          </Link>
          <nav className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/">Home</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/login">Login</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Global Leaderboard</h2>
            <p className="text-muted-foreground">
              Top performers worldwide ranked by total captures
            </p>
          </div>

          {error ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-destructive">{error}</p>
                <Button onClick={loadLeaderboard} className="mt-4">
                  Try Again
                </Button>
              </CardContent>
            </Card>
          ) : loading ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Loading leaderboard...</p>
              </CardContent>
            </Card>
          ) : leaderboard.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No entries yet. Be the first!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((entry, index) => (
                <Card key={entry.user_id} className={index < 3 ? 'border-2 border-primary/20' : ''}>
                  <CardContent className="py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 text-center font-bold text-lg">
                        {getRankIcon(index) || `#${index + 1}`}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-lg">
                          {entry.username || 'Anonymous'}
                        </div>
                        {entry.country_code && (
                          <div className="text-sm text-muted-foreground">
                            {entry.country_code}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{entry.total_captures}</div>
                        <div className="text-xs text-muted-foreground">captures</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
