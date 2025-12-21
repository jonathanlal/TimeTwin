import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/providers'

export const metadata: Metadata = {
  metadataBase: new URL('https://timetwin.xyz'),
  title: 'TimeTwin - Synchronicity & Angel Numbers Tracker',
  description: 'Track 11:11, repeating angel numbers, and daily synchronicities. Compete on the global leaderboard and share your magic moments.',
  keywords: ['synchronicity', '11:11', 'angel numbers', 'numerology', 'repeating numbers', 'spiritual journal', 'time tracking'],
  openGraph: {
    title: 'TimeTwin - Catch 11:11 & Angel Numbers',
    description: 'The fun, visual journal for collecting and celebrating your daily synchronicities.',
    type: 'website',
    locale: 'en_US',
    siteName: 'TimeTwin',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TimeTwin - Synchronicity Tracker',
    description: 'Never miss 11:11 again. Track your streaks and join the community.',
  },
  appleWebApp: {
    title: 'TimeTwin',
  },
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
