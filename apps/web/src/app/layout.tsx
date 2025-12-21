import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/providers'

export const metadata: Metadata = {
  metadataBase: new URL('https://timetwin.xyz'),
  title: 'TimeTwin | Track Synchronicities',
  description: 'Join the global community capturing 11:11 moments.',
  keywords: ['synchronicity', '11:11', 'numerology', 'spiritual journal', 'mindfulness'],
  openGraph: {
    title: 'TimeTwin | Track Synchronicities',
    description: 'Join the global community capturing 11:11 moments.',
    type: 'website',
    locale: 'en_US',
    siteName: 'TimeTwin',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TimeTwin',
    description: 'Join the global community capturing 11:11 moments.',
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
