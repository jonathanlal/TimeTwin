'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Timer, Trophy, Medal, Award, User as UserIcon } from 'lucide-react'
import { getGlobalLeaderboard, getCountryLeaderboard, getActiveCountries, type LeaderboardEntry, type Country } from '@timetwin/api-sdk'
import { MainNav } from '@/components/MainNav'

export default function LeaderboardPage() {
  const { initialized } = useAuth()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [countries, setCountries] = useState<Country[]>([])
  const [selectedCountry, setSelectedCountry] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (initialized) {
      loadCountries()
      loadLeaderboard()
    }
  }, [initialized])

  useEffect(() => {
    loadLeaderboard()
  }, [selectedCountry])

  const loadCountries = async () => {
    try {
      const { data } = await getActiveCountries()
      if (data) {
        // Map any DB shape to UI shape (assuming iso_code + name)
        const mapped = data.map((c: any) => ({
            code: c.iso_code,
            name: c.name
        })).sort((a: any, b: any) => a.name.localeCompare(b.name))
        setCountries(mapped as Country[])
      }
    } catch {
      // Silently fail - countries are optional
    }
  }

  const loadLeaderboard = async () => {
    try {
      setLoading(true)
      const result = selectedCountry === 'all'
        ? await getGlobalLeaderboard({ limit: 50 })
        : await getCountryLeaderboard(selectedCountry, { limit: 50 })

      if (result.error) {
        setError(result.error.message)
        return
      }

      if (result.data) {
        setLeaderboard(result.data)
      }
    } catch {
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
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Timer className="h-6 w-6" />
            <h1 className="text-2xl font-bold">TimeTwin</h1>
          </Link>
          <MainNav />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold mb-4">Global Leaderboard</h2>
            <p className="text-muted-foreground">
              Top performers worldwide ranked by total captures
            </p>
          </div>

          {/* Country Filter */}
          <Card className="mb-8">
            <CardContent className="py-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium mr-2">Filter by country:</span>
                <Button
                  size="sm"
                  variant={selectedCountry === 'all' ? 'primary' : 'outline'}
                  onClick={() => setSelectedCountry('all')}
                >
                  All Countries
                </Button>
                {countries.map((country) => (
                  <Button
                    key={country.code}
                    size="sm"
                    variant={selectedCountry === country.code ? 'primary' : 'outline'}
                    onClick={() => setSelectedCountry(country.code)}
                  >
                    {country.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

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
                <Link key={entry.user_id} href={`/user/${entry.user_id}`}>
                  <Card className={`hover:border-primary transition-colors cursor-pointer ${index < 3 ? 'border-2 border-primary/20' : ''}`}>
                    <CardContent className="py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 text-center font-bold text-lg">
                          {getRankIcon(index) || `#${index + 1}`}
                        </div>
                        <div className="flex-1 flex items-center gap-3">
                           {/* Avatar */}
                           <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                              {(entry as any).avatar_url ? (
                                  <img src={(entry as any).avatar_url} alt="" className="h-full w-full object-cover"/>
                              ) : <UserIcon className="h-5 w-5 text-muted-foreground" />} 
                           </div>
                           
                           <div>
                              <div className="font-semibold text-lg hover:text-primary transition-colors">
                                {entry.username || 'Anonymous'}
                              </div>
                              {entry.country_code && (
                                <div className="text-sm text-muted-foreground">
                                  {entry.country_code}
                                </div>
                              )}
                           </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">{entry.total_captures}</div>
                          <div className="text-xs text-muted-foreground">captures</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
