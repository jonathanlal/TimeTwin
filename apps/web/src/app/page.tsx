import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Timer, Trophy, Users } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Timer className="h-6 w-6" />
            <h1 className="text-2xl font-bold">TimeTwin</h1>
          </div>
          <nav className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/leaderboard">Leaderboard</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Sign Up</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-5xl font-bold tracking-tight mb-6">
            Track Your Time,
            <br />
            <span className="text-primary">Compete Globally</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join TimeTwin to track your time captures, compete with users around the world,
            and climb the global leaderboard.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/leaderboard">View Leaderboard</Link>
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-20">
          <h3 className="text-3xl font-bold text-center mb-12">
            Why Choose TimeTwin?
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Timer className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Precise Time Tracking</CardTitle>
                <CardDescription>
                  Track your time with millisecond precision. Start and stop captures with ease.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Trophy className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Global Leaderboard</CardTitle>
                <CardDescription>
                  Compete with users worldwide. See where you rank and climb to the top.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Community Driven</CardTitle>
                <CardDescription>
                  Join a community of time trackers. Share your achievements and stats.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* Stats Section */}
        <section className="container mx-auto px-4 py-20">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="py-12">
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-4xl font-bold mb-2">1M+</div>
                  <div className="text-primary-foreground/80">Total Captures</div>
                </div>
                <div>
                  <div className="text-4xl font-bold mb-2">10K+</div>
                  <div className="text-primary-foreground/80">Active Users</div>
                </div>
                <div>
                  <div className="text-4xl font-bold mb-2">100+</div>
                  <div className="text-primary-foreground/80">Countries</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-20 text-center">
          <h3 className="text-3xl font-bold mb-6">
            Ready to Start Tracking?
          </h3>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of users tracking their time and competing on the global leaderboard.
          </p>
          <Button size="lg" asChild>
            <Link href="/signup">Sign Up Now</Link>
          </Button>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Timer className="h-5 w-5" />
              <span className="font-semibold">TimeTwin</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2024 TimeTwin. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
