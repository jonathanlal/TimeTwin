'use client'

import { useEffect, useState } from 'react'
import { SaveButton } from '@/components/SaveButton'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getMyProfile, updateMyProfile } from '@timetwin/api-sdk'
import { useAuth } from '@/contexts/AuthContext'
import {
  CapturePanelMode,
  emitCapturePanelModeChange,
  subscribeToCapturePanelModeChange,
} from '@/lib/capture-panel-events'
import { Minimize2, Square, X, Clock3 } from 'lucide-react'

const LABELS: Record<CapturePanelMode, string> = {
  expanded: 'Expanded',
  collapsed: 'Collapsed',
  hidden: 'Hidden',
}

export function FloatingCapturePanel() {
  const { user } = useAuth()
  const [mode, setMode] = useState<CapturePanelMode>('expanded')
  const [loadingPref, setLoadingPref] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    let cancelled = false
    if (!user) {
      setLoadingPref(false)
      return
    }

    getMyProfile()
      .then(({ data }) => {
        if (cancelled) return
        if (data?.capture_panel_mode) {
          setMode(data.capture_panel_mode as CapturePanelMode)
        }
      })
      .catch((error) => {
        console.error('Failed to load capture panel preference:', error)
      })
      .finally(() => {
        if (!cancelled) setLoadingPref(false)
      })

    return () => {
      cancelled = true
    }
  }, [user?.id])

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const unsubscribe = subscribeToCapturePanelModeChange((nextMode) => {
      setMode(nextMode)
    })
    return () => {
      unsubscribe()
    }
  }, [])

  const persistMode = async (nextMode: CapturePanelMode) => {
    setMode(nextMode)
    if (!user) return
    try {
      setUpdating(true)
      await updateMyProfile({ capture_panel_mode: nextMode })
      emitCapturePanelModeChange(nextMode)
    } catch (error) {
      console.error('Failed to update capture panel preference:', error)
    } finally {
      setUpdating(false)
    }
  }

  if (!user || loadingPref) {
    return null
  }

  if (mode === 'hidden') {
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <Button
          variant="outline"
          size="sm"
          onClick={() => persistMode('collapsed')}
          disabled={updating}
        >
          Reopen Quick Capture
        </Button>
      </div>
    )
  }

  const isCollapsed = mode === 'collapsed'
  const timeParts = formatTimeParts(currentTime)

  return (
    <div className="fixed bottom-6 right-6 z-40">
      <Card className="w-80 border-white/10 bg-slate-950/85 backdrop-blur-xl shadow-2xl shadow-black/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Clock3 className="h-4 w-4 text-sky-300" />
              Twin Capture
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-300"
                onClick={() => persistMode(isCollapsed ? 'expanded' : 'collapsed')}
                title={isCollapsed ? 'Expand panel' : 'Collapse panel'}
              >
                {isCollapsed ? <Square className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-300"
                onClick={() => persistMode('hidden')}
                title="Hide panel"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {isCollapsed ? (
            <div className="mt-3 flex items-center justify-between">
              <div className="text-lg font-semibold text-white tabular-nums">
                {timeParts.hours}:{timeParts.minutes}
                <span className="text-slate-400">:{timeParts.seconds}</span>
              </div>
              <SaveButton size="compact" />
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              <div className="text-center">
                <p className="text-3xl font-semibold text-white tabular-nums tracking-tight">
                  {timeParts.hours}:{timeParts.minutes}
                  <span className="text-slate-400">:{timeParts.seconds}</span>
                </p>
                <p className="text-xs text-slate-400 mt-1">{LABELS[mode]} mode</p>
              </div>
              <p className="text-xs text-slate-400">
                Save without leaving the page. Available only during twin time (e.g. 11:11, 22:22).
              </p>
              <SaveButton fullWidth />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function formatTimeParts(date: Date) {
  return {
    hours: date.getHours().toString().padStart(2, '0'),
    minutes: date.getMinutes().toString().padStart(2, '0'),
    seconds: date.getSeconds().toString().padStart(2, '0'),
  }
}
