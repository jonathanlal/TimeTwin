'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Timer, Sparkles, Smile, Meh, Brain, Heart, Star, Clock } from 'lucide-react'
import { getMyCaptures, type Capture, type CaptureMood } from '@timetwin/api-sdk'
import { MainNav } from '@/components/MainNav'

const MOOD_OPTIONS: Array<{ value: CaptureMood; label: string; icon: typeof Sparkles; color: string }> = [
  { value: 'excited', label: 'Excited', icon: Sparkles, color: 'text-yellow-500' },
  { value: 'happy', label: 'Happy', icon: Smile, color: 'text-green-500' },
  { value: 'neutral', label: 'Neutral', icon: Meh, color: 'text-gray-500' },
  { value: 'thoughtful', label: 'Thoughtful', icon: Brain, color: 'text-blue-500' },
  { value: 'grateful', label: 'Grateful', icon: Heart, color: 'text-pink-500' },
  { value: 'hopeful', label: 'Hopeful', icon: Star, color: 'text-purple-500' },
]

export default function HistoryPage() {
  const router = useRouter()
  const { user, initialized } = useAuth()
  const [captures, setCaptures] = useState<Capture[]>([])
  const [filteredCaptures, setFilteredCaptures] = useState<Capture[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [moodFilter, setMoodFilter] = useState<string>('all')

  useEffect(() => {
    if (initialized && !user) {
      router.push('/login')
    }
  }, [initialized, user, router])

  useEffect(() => {
    if (initialized && user) {
      loadCaptures()
    }
  }, [initialized, user])

  useEffect(() => {
    applyFilters()
  }, [captures, startDate, endDate, moodFilter])

  const loadCaptures = async () => {
    try {
      setLoading(true)
      const { data, error } = await getMyCaptures({ limit: 1000 })

      if (error) {
        setError(error.message)
        return
      }

      if (data) {
        setCaptures(data)
      }
    } catch {
      setError('Failed to load captures')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...captures]

    // Date filters
    if (startDate) {
      filtered = filtered.filter(c => new Date(c.server_ts) >= new Date(startDate))
    }
    if (endDate) {
      filtered = filtered.filter(c => new Date(c.server_ts) <= new Date(endDate + 'T23:59:59'))
    }

    // Mood filter
    if (moodFilter !== 'all') {
      if (moodFilter === 'none') {
        filtered = filtered.filter(c => !c.mood)
      } else {
        filtered = filtered.filter(c => c.mood === moodFilter)
      }
    }

    setFilteredCaptures(filtered)
  }

  const getMoodIcon = (mood: string | null) => {
    if (!mood) return null
    const moodOption = MOOD_OPTIONS.find(m => m.value === mood)
    if (!moodOption) return null
    const Icon = moodOption.icon
    return <Icon className={`h-5 w-5 ${moodOption.color}`} />
  }

  const getTimingColor = (diffSeconds: number) => {
    if (diffSeconds <= 3) return 'text-green-500'
    if (diffSeconds <= 10) return 'text-yellow-500'
    return 'text-muted-foreground'
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const hasCaptures = captures.length > 0

  if (!initialized || loading) {
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
          <MainNav />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="mb-8">
            <h2 className="text-4xl font-bold mb-2">Capture History</h2>
            <p className="text-muted-foreground">
              View all your time captures with notes and moods
            </p>
          </div>

          {error ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-destructive">{error}</p>
                <Button onClick={loadCaptures} className="mt-4">
                  Try Again
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {!hasCaptures ? (
                <Card className="border border-dashed border-primary/30 bg-primary/5">
                  <CardContent className="py-12 text-center">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-primary" />
                    <h3 className="text-2xl font-semibold mb-2">No captures yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Your history will light up as soon as you log your first twin time moment.
                    </p>
                    <Button asChild>
                      <Link href="/timer">Capture Your First Moment</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Filters */}
                  <Card className="mb-8">
                    <CardHeader>
                      <CardTitle>Filters</CardTitle>
                      <CardDescription>Filter your captures by date and mood</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="startDate">Start Date</Label>
                          <Input
                            id="startDate"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="endDate">End Date</Label>
                          <Input
                            id="endDate"
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Mood</Label>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant={moodFilter === 'all' ? 'default' : 'outline'}
                              onClick={() => setMoodFilter('all')}
                            >
                              All moods
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant={moodFilter === 'none' ? 'default' : 'outline'}
                              onClick={() => setMoodFilter('none')}
                            >
                              No mood
                            </Button>
                            {MOOD_OPTIONS.map(option => {
                              const Icon = option.icon
                              return (
                                <Button
                                  key={option.value}
                                  type="button"
                                  size="sm"
                                  variant={moodFilter === option.value ? 'default' : 'outline'}
                                  onClick={() => setMoodFilter(option.value)}
                                >
                                  <Icon className="h-3 w-3 mr-1" />
                                  {option.label}
                                </Button>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Captures List */}
                  {filteredCaptures.length === 0 ? (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          No captures match your filters. Try adjusting the range or mood selections.
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {filteredCaptures.map((capture) => (
                        <Card key={capture.id}>
                          <CardContent className="py-4">
                            <div className="flex items-start gap-4">
                              <div className="flex-shrink-0 w-12 flex items-center justify-center">
                                {getMoodIcon(capture.mood)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-semibold text-lg">
                                    {capture.label_str || 'N/A'}
                                  </span>
                                  <span className={`text-sm font-medium ${getTimingColor(capture.diff_seconds)}`}>
                                    {capture.diff_seconds}s
                                  </span>
                                  <span className="text-sm text-muted-foreground">
                                    {formatDate(capture.server_ts)}
                                  </span>
                                </div>
                                {capture.note && (
                                  <p className="text-sm text-muted-foreground italic">
                                    "{capture.note}"
                                  </p>
                                )}
                                {capture.mood && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {MOOD_OPTIONS.find(m => m.value === capture.mood)?.label}
                                  </p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  {filteredCaptures.length > 0 && (
                    <Card className="mt-8">
                      <CardContent className="py-6">
                        <div className="text-center">
                          <p className="text-muted-foreground">
                            Showing {filteredCaptures.length} of {captures.length} total captures
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
