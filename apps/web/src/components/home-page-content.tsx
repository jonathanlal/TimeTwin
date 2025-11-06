'use client'

import type { LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ArrowRight,
  CalendarClock,
  Camera,
  Heart,
  Infinity,
  LineChart,
  Rocket,
  Share2,
  ShieldCheck,
  Smile,
  Sparkles,
  Smartphone,
  TimerReset,
  Timer,
  Trophy,
  User,
  LogOut,
} from 'lucide-react'
import { signOut } from '@timetwin/api-sdk'
import { useRouter } from 'next/navigation'

const heroPoints: Array<{ icon: LucideIcon; label: string }> = [
  { icon: Sparkles, label: 'Capture repeating numbers with one tap' },
  { icon: CalendarClock, label: 'Syncs across iOS, Android, and web' },
  { icon: Smile, label: 'Completely free with zero ads' },
]

const highlights: Array<{ title: string; description: string; icon: LucideIcon }> = [
  {
    title: 'Collect the magic minute',
    description:
      'Trade screenshots for a playful journal that logs every 11:11, 22:22, and mirrored moment.',
    icon: Camera,
  },
  {
    title: 'Spot patterns over time',
    description:
      'Charts and streaks show when synchronicities appear the most so you can plan your next wish.',
    icon: LineChart,
  },
  {
    title: 'Celebrate with friends',
    description:
      'Share highlight reels or keep them private until you are ready to reveal your streak.',
    icon: Share2,
  },
]

const steps: Array<{ title: string; description: string; icon: LucideIcon }> = [
  {
    title: 'Tap when the numbers align',
    description:
      'TimeTwin nudges you moments before the minute hits so you are ready when the clock reads 11:11.',
    icon: TimerReset,
  },
  {
    title: 'Tag the vibe',
    description: 'Add a quick mood or note to remember exactly what you wished for in that instant.',
    icon: Heart,
  },
  {
    title: 'Relive and share',
    description:
      'Weekly recaps and friendly leaderboards keep the energy high and the community buzzing.',
    icon: Rocket,
  },
]

const freePerks: Array<{ title: string; description: string; icon: LucideIcon }> = [
  {
    title: '100% free forever',
    description: 'No trials, no paywalls, and absolutely zero ads. Just the joy of synchronicities.',
    icon: Smile,
  },
  {
    title: 'Everywhere you are',
    description: 'Native mobile apps plus a web experience that stay perfectly in sync.',
    icon: Smartphone,
  },
  {
    title: 'Private by default',
    description: 'Keep captures to yourself or share them with your crew whenever you feel like it.',
    icon: ShieldCheck,
  },
]

const sampleMoments: Array<{ time: string; note: string; detail: string; icon: LucideIcon }> = [
  {
    time: '11:11',
    note: 'Morning wish locked',
    detail: 'Streak 24 days',
    icon: Sparkles,
  },
  {
    time: '22:22',
    note: 'Crew cosmic high-five',
    detail: 'Shared with Team Nebula',
    icon: Share2,
  },
  {
    time: '12:34',
    note: 'Sequential vibes spotted',
    detail: 'Added to pattern journal',
    icon: Infinity,
  },
]

export function HomePageContent() {
  const router = useRouter()
  const { user } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    router.refresh()
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 -z-30 animate-tilt-glow bg-[radial-gradient(circle_at_20%_10%,rgba(56,189,248,0.25),transparent_60%),radial-gradient(circle_at_80%_0%,rgba(129,140,248,0.2),transparent_55%),radial-gradient(circle_at_50%_120%,rgba(45,212,191,0.18),transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 -z-20 bg-grid-faint opacity-40 mask-radial-fade" />

      <div className="relative mx-auto flex min-h-screen max-w-[1180px] flex-col px-6">
        <header className="flex items-center justify-between py-8">
          <Link href="/" className="flex items-center gap-3 text-lg font-semibold tracking-tight text-white">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-500/15 text-sky-300">
              <CalendarClock className="h-5 w-5" />
            </span>
            TimeTwin
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-300 md:flex">
            {user ? (
              <>
                <Link className="transition hover:text-sky-300" href="/timer">
                  <Timer className="inline h-4 w-4 mr-1" />
                  Timer
                </Link>
                <Link className="transition hover:text-sky-300" href="/leaderboard">
                  <Trophy className="inline h-4 w-4 mr-1" />
                  Leaderboard
                </Link>
                <Link className="transition hover:text-sky-300" href="/profile">
                  <User className="inline h-4 w-4 mr-1" />
                  Profile
                </Link>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-1" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link className="transition hover:text-sky-300" href="#learn">
                  What it does
                </Link>
                <Link className="transition hover:text-sky-300" href="#how">
                  How it works
                </Link>
                <Link className="transition hover:text-sky-300" href="#download">
                  Download
                </Link>
                <Link className="transition hover:text-sky-300" href="/leaderboard">
                  Leaderboard
                </Link>
                <Button asChild variant="outline" size="sm">
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/signup">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </>
            )}
          </nav>
          {!user && (
            <Button asChild size="sm" className="md:hidden">
              <Link href="/signup">Get Started</Link>
            </Button>
          )}
        </header>

        {/* Rest of the page content - only showing the full page structure, actual content continues below */}
        <main className="flex-1 pb-20">
          {/* Hero Section */}
          <section id="hero" className="relative pb-24 pt-20 sm:pt-28">
            <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div className="space-y-8">
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-900/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-sky-300">
                  Free forever
                </span>
                <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
                  Catch 11:11, <br />
                  track the synchronicities, <br />
                  chase the streak
                </h1>
                <p className="max-w-lg text-lg leading-relaxed text-slate-300">
                  TimeTwin is the fun, visual journal for collecting and celebrating repeating time moments. No
                  ads, no subscriptions, just simple joy at your fingertips.
                </p>
                <ul className="space-y-3">
                  {heroPoints.map(({ icon: Icon, label }, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <Icon className="h-5 w-5 text-sky-400" />
                      <span className="text-slate-200">{label}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
                  {user ? (
                    <Button asChild size="lg" className="text-base">
                      <Link href="/timer">
                        Go to Timer
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                  ) : (
                    <>
                      <Button asChild size="lg" className="text-base">
                        <Link href="/signup">
                          Start tracking free
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="lg" className="text-base">
                        <Link href="/login">Sign In</Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
              <div className="grid gap-4">
                {sampleMoments.map(({ time, note, detail, icon: Icon }, idx) => (
                  <Card key={idx} className="bg-slate-900/50 backdrop-blur-sm border-slate-800">
                    <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-500/10 text-sky-400">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-2xl font-semibold tracking-tight text-white">{time}</CardTitle>
                        <CardDescription className="text-slate-400">{note}</CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-slate-500">{detail}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* Highlights Section */}
          <section id="learn" className="scroll-mt-20 pb-20">
            <h2 className="pb-12 text-center text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Why people love TimeTwin
            </h2>
            <div className="grid gap-8 sm:grid-cols-3">
              {highlights.map(({ title, description, icon: Icon }, idx) => (
                <Card key={idx} className="border-slate-800 bg-slate-900/30 backdrop-blur-sm">
                  <CardHeader>
                    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-sky-500/10 text-sky-400">
                      <Icon className="h-7 w-7" />
                    </div>
                    <CardTitle className="text-lg text-white">{title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed text-slate-400">{description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* How It Works */}
          <section id="how" className="scroll-mt-20 pb-20">
            <h2 className="pb-12 text-center text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              How it works
            </h2>
            <div className="grid gap-10 sm:grid-cols-3">
              {steps.map(({ title, description, icon: Icon }, idx) => (
                <div key={idx} className="relative flex flex-col items-center text-center">
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-teal-400 text-white shadow-lg shadow-sky-500/30">
                    <Icon className="h-8 w-8" />
                  </div>
                  <h3 className="mb-3 text-lg font-semibold text-white">{title}</h3>
                  <p className="text-sm leading-relaxed text-slate-400">{description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Free Perks */}
          <section id="perks" className="pb-20">
            <h2 className="pb-12 text-center text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Everything included, always free
            </h2>
            <div className="grid gap-8 sm:grid-cols-3">
              {freePerks.map(({ title, description, icon: Icon }, idx) => (
                <div key={idx} className="flex flex-col items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-500/10 text-teal-400">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="mb-2 text-lg font-semibold text-white">{title}</h3>
                    <p className="text-sm leading-relaxed text-slate-400">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Download Section */}
          <section id="download" className="scroll-mt-20 pb-10">
            <Card className="border-2 border-sky-500/20 bg-gradient-to-br from-slate-900/80 to-slate-950/80 backdrop-blur-sm">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-semibold text-white sm:text-3xl">
                  Ready to capture your moments?
                </CardTitle>
                <CardDescription className="text-base text-slate-300">
                  Download TimeTwin for free on iOS, Android, or use the web app
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                {user ? (
                  <Button asChild size="lg">
                    <Link href="/timer">Open Web App</Link>
                  </Button>
                ) : (
                  <Button asChild size="lg">
                    <Link href="/signup">Get Started Free</Link>
                  </Button>
                )}
                <Button asChild variant="outline" size="lg">
                  <Link href="https://apps.apple.com" target="_blank">
                    Download on iOS
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="https://play.google.com" target="_blank">
                    Download on Android
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </section>
        </main>

        <footer className="border-t border-slate-800 py-8 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} TimeTwin. All rights reserved.
        </footer>
      </div>
    </div>
  )
}
