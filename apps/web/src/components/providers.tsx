'use client'

import { AuthProvider } from '@/contexts/AuthContext'
import { ReactNode } from 'react'
import { FloatingCapturePanel } from './FloatingCapturePanel'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <FloatingCapturePanel />
    </AuthProvider>
  )
}
