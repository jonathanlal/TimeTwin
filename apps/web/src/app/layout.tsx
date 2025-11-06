import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/providers'

export const metadata: Metadata = {
  title: 'TimeTwin - Track Your Time',
  description: 'Track your time, compete with others on the global leaderboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans bg-background text-foreground antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
