import type { LucideIcon } from 'lucide-react'
import Link from 'next/link'
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
} from 'lucide-react'

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

export default function HomePage() {
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
            <Button asChild size="sm">
              <Link href="#download">
                Get the app
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </nav>
          <Button asChild size="sm" className="md:hidden">
            <Link href="#download">Download</Link>
          </Button>
        </header>

        <main className="flex-1 pb-20">
          <section id="hero" className="relative pb-24 pt-20 sm:pt-28">
            <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div className="space-y-8">
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-900/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-sky-300">
                  Free forever
                </span>
                <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
                  Capture the magic minute.
                  <br />
                  <span className="bg-gradient-to-r from-sky-400 via-cyan-300 to-violet-300 bg-clip-text text-transparent">
                    Celebrate every synchronicity.
                  </span>
                </h1>
                <p className="max-w-xl text-base text-slate-300 sm:text-lg">
                  TimeTwin is the playful tracker for people who see meaning in repeating numbers. Tap once when 11:11
                  appears, log the vibe, and watch your streaks light up across mobile and web.
                </p>
                <div className="flex flex-col gap-4 sm:flex-row">
                  <Button asChild size="lg">
                    <Link href="#download">
                      Download the app
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="border-white/10 bg-slate-900/60 text-white hover:bg-slate-900/80"
                  >
                    <Link href="/leaderboard">Explore the community</Link>
                  </Button>
                </div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                  iOS | Android | Web | No ads ever
                </p>
                <div className="grid gap-3 sm:grid-cols-3">
                  {heroPoints.map((point) => (
                    <div
                      key={point.label}
                      className="flex items-center gap-3 rounded-2xl bg-slate-900/65 px-4 py-3"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/15 text-sky-300">
                        <point.icon className="h-5 w-5" />
                      </span>
                      <span className="text-sm text-slate-200">{point.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Card className="relative overflow-hidden rounded-3xl bg-slate-900/70 p-0 shadow-[0_45px_90px_-60px_rgba(14,165,233,0.65)] animate-float-soft">
                <div className="absolute inset-0 -z-10 animate-gradient bg-[linear-gradient(140deg,rgba(56,189,248,0.35),rgba(59,130,246,0.25),rgba(129,140,248,0.35))]" />
                <CardHeader className="p-8 pb-4 text-white">
                  <span className="text-xs uppercase tracking-[0.28em] text-slate-200/80">Sample timeline</span>
                  <CardTitle className="text-3xl font-semibold text-white">Your Magic Minute feed</CardTitle>
                  <CardDescription className="text-slate-200/80">
                    A playful log of the synchronicities you capture and share.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 p-8 pt-4">
                  {sampleMoments.map((moment) => (
                    <div
                      key={moment.time}
                      className="flex items-center justify-between rounded-2xl bg-slate-950/45 px-4 py-4 transition hover:bg-sky-500/10"
                    >
                      <div className="flex items-center gap-4">
                        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900/70 text-sky-200">
                          <moment.icon className="h-5 w-5" />
                        </span>
                        <div>
                          <p className="text-lg font-semibold text-white">{moment.time}</p>
                          <p className="text-sm text-slate-300">{moment.note}</p>
                        </div>
                      </div>
                      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                        {moment.detail}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </section>

          <section id="learn" className="pb-24">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-semibold text-white sm:text-4xl">Why TimeTwin exists</h2>
              <p className="mt-4 text-base text-slate-300 sm:text-lg">
                This is a community project for anyone fascinated by number synchronicities. Capture the magic, keep it
                organized, and turn moments into a story you can revisit anytime.
              </p>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {highlights.map((feature) => (
                <Card
                  key={feature.title}
                  className="h-full bg-slate-900/60 p-8 transition hover:-translate-y-1 hover:shadow-[0_35px_65px_-50px_rgba(14,165,233,0.8)]"
                >
                  <CardHeader className="p-0 pb-6 text-white">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-sky-400/40 bg-sky-500/10 text-sky-300">
                      <feature.icon className="h-5 w-5" />
                    </span>
                    <CardTitle className="mt-6 text-xl text-white">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <CardDescription className="text-sm leading-relaxed text-slate-300">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section id="how" className="grid gap-12 pb-24 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-semibold text-white sm:text-4xl">How it works</h2>
              <p className="text-base text-slate-300 sm:text-lg">
                TimeTwin keeps things simple. One tap to capture, a quick tag to remember the moment, and playful
                recaps that keep you inspired.
              </p>
            </div>
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div
                  key={step.title}
                  className="flex items-start gap-4 rounded-3xl bg-slate-900/55 px-6 py-5 transition hover:-translate-y-1 hover:bg-sky-500/10"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950/70 text-sky-200">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                      Step {String(index + 1).padStart(2, '0')}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold text-white">{step.title}</h3>
                    <p className="mt-2 text-sm text-slate-300">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="pb-24">
            <div className="grid gap-6 rounded-3xl bg-slate-900/60 p-10 backdrop-blur sm:grid-cols-3">
              {freePerks.map((perk) => (
                <div key={perk.title} className="space-y-4">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 bg-slate-950 text-sky-300">
                    <perk.icon className="h-4 w-4" />
                  </span>
                  <h3 className="text-lg font-semibold text-white">{perk.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-300">{perk.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="download" className="pb-24">
            <Card className="relative overflow-hidden rounded-3xl bg-slate-900/65 p-0">
              <div className="absolute inset-0 -z-10 animate-gradient bg-[linear-gradient(135deg,rgba(56,189,248,0.25),rgba(99,102,241,0.25),rgba(45,212,191,0.2))]" />
              <CardHeader className="p-10 pb-6 text-white">
                <span className="text-xs uppercase tracking-[0.28em] text-slate-200/80">Download TimeTwin</span>
                <CardTitle className="text-3xl font-semibold text-white sm:text-4xl">
                  Start logging synchronicities today
                </CardTitle>
                <CardDescription className="text-base text-slate-200/80 sm:text-lg">
                  Grab the mobile app or open the web experience. Everything stays in sync and it is all completely
                  free.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4 p-10 pt-0 sm:flex-row sm:justify-center">
                <Button asChild size="lg" className="px-8">
                  <Link href="https://apps.apple.com" target="_blank" rel="noreferrer">
                    Download for iOS
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white/20 bg-slate-900/50 px-8 text-white hover:bg-slate-900/70"
                >
                  <Link href="https://play.google.com" target="_blank" rel="noreferrer">
                    Download for Android
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="ghost"
                  className="text-slate-200 hover:bg-slate-800/60"
                >
                  <Link href="/leaderboard">Open web app</Link>
                </Button>
              </CardContent>
            </Card>
          </section>

          <section className="pb-24">
            <Card className="rounded-3xl bg-slate-900/60 p-0">
              <CardHeader className="p-10">
                <CardTitle className="text-3xl font-semibold text-white sm:text-4xl">
                  Ready to make every 11:11 count?
                </CardTitle>
                <CardDescription className="mt-4 text-base text-slate-300 sm:text-lg">
                  Join thousands of fans who are capturing synchronicities together. TimeTwin is community-run,
                  privacy-first, and forever free.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4 px-10 pb-10 sm:flex-row sm:justify-center">
                <Button asChild size="lg">
                  <Link href="#download">Get TimeTwin now</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="border-white/10 bg-slate-900/60 text-white hover:bg-slate-900/80"
                >
                  <Link href="/signup">Create a free account</Link>
                </Button>
              </CardContent>
            </Card>
          </section>
        </main>

        <footer className="flex flex-col items-center justify-between gap-6 border-t border-slate-900/60 py-8 text-sm text-slate-500 md:flex-row">
          <div className="flex items-center gap-2 text-slate-300">
            <CalendarClock className="h-4 w-4" />
            <span>TimeTwin</span>
          </div>
          <div className="flex gap-5">
            <Link className="hover:text-sky-300" href="#learn">
              What it does
            </Link>
            <Link className="hover:text-sky-300" href="#download">
              Download
            </Link>
            <Link className="hover:text-sky-300" href="/leaderboard">
              Leaderboard
            </Link>
            <Link className="hover:text-sky-300" href="/signup">
              Sign up
            </Link>
          </div>
          <span>&copy; {new Date().getFullYear()} TimeTwin. Happy synchronicities.</span>
        </footer>
      </div>
    </div>
  )
}

