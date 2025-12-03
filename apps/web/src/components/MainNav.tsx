'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Timer', href: '/timer' },
  { label: 'Leaderboard', href: '/leaderboard' },
  { label: 'History', href: '/history' },
  { label: 'Insights', href: '/insights' },
  { label: 'Search', href: '/search' },
  { label: 'Profile', href: '/profile' },
]

export function MainNav() {
  const pathname = usePathname()
  const { user } = useAuth()

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <nav className="flex flex-wrap items-center justify-end gap-2">
      {NAV_ITEMS.map((item) => {
        const active = isActive(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'rounded-full px-3 py-1.5 text-sm transition',
              active
                ? 'bg-primary/10 text-primary font-semibold border border-primary/40'
                : 'text-muted-foreground hover:text-foreground border border-transparent hover:border-border',
            )}
          >
            {item.label}
          </Link>
        )
      })}
      {!user && (
        <>
          <Link
            href="/login"
            className={cn(
              'rounded-full px-3 py-1.5 text-sm transition text-muted-foreground hover:text-primary',
              isActive('/login') && 'text-primary font-semibold',
            )}
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className={cn(
              'rounded-full px-3 py-1.5 text-sm transition border border-primary text-primary hover:bg-primary hover:text-primary-foreground',
              isActive('/signup') && 'bg-primary text-primary-foreground',
            )}
          >
            Sign Up
          </Link>
        </>
      )}
    </nav>
  )
}
