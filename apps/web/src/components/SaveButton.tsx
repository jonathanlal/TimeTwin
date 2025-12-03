'use client'

import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { recordCapture, isTwinTime } from '@timetwin/api-sdk'
import { cn } from '@/lib/utils'

type SaveButtonSize = 'default' | 'compact'

interface SaveButtonProps {
  size?: SaveButtonSize
  fullWidth?: boolean
  className?: string
}

export function SaveButton({ size = 'default', fullWidth = false, className }: SaveButtonProps) {
  const [loading, setLoading] = useState(false)
  const [serverWindowOpen, setServerWindowOpen] = useState(false)

  // Poll server window status every 10 seconds
  useEffect(() => {
    let mounted = true
    const checkServerWindow = async () => {
      try {
        const { open } = await isTwinTime()
        if (mounted) {
          setServerWindowOpen(open)
        }
      } catch (error) {
        console.error('Failed to check twin time window:', error)
      }
    }

    checkServerWindow()
    const interval = setInterval(checkServerWindow, 10000)
    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [])

  const handleCapture = async () => {
    setLoading(true)

    try {
      const { open } = await isTwinTime()
      if (!open) {
        setServerWindowOpen(false)
        alert('Twin time window closed. Wait until the minute matches the hour (e.g. 11:11).')
        return
      }

      const { data, error } = await recordCapture({})

      if (error) {
        alert(`Error: ${error.message}`)
        return
      }

      if (!data) {
        alert('No response from server')
        return
      }

      setServerWindowOpen(Boolean(data.success))
      alert(data.message)
    } catch (error) {
      console.error('Capture error:', error)
      alert('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const sizeClasses = size === 'compact' ? 'h-10 px-4 text-sm' : 'h-14 px-8 text-lg'
  const enabled = !loading && serverWindowOpen

  return (
    <Button
      onClick={handleCapture}
      disabled={!enabled}
      className={cn(
        'border-2 font-bold transition-all duration-300 disabled:cursor-not-allowed',
        enabled
          ? 'border-emerald-400 text-white shadow-[0_0_25px_rgba(16,185,129,0.35)] bg-gradient-to-r from-emerald-500 via-lime-400 to-emerald-500 animate-shimmer hover:shadow-[0_0_30px_rgba(16,185,129,0.55)]'
          : 'border-red-500/40 text-red-300 bg-red-500/5',
        fullWidth && 'w-full',
        sizeClasses,
        className,
      )}
      title={
        serverWindowOpen
          ? 'Capture this moment!'
          : 'Only available during twin time (e.g. 11:11, 23:23) based on server time'
      }
    >
      {loading ? 'SAVING...' : serverWindowOpen ? 'SAVE' : 'WAIT'}
    </Button>
  )
}
