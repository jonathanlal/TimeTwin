'use client'

import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { recordCapture } from '@timetwin/api-sdk'

export function SaveButton() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [loading, setLoading] = useState(false)

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const isDoubleDigits = () => {
    const hours = currentTime.getHours().toString().padStart(2, '0')
    const minutes = currentTime.getMinutes().toString().padStart(2, '0')
    return hours === minutes
  }

  const handleCapture = async () => {
    if (!isDoubleDigits()) return

    setLoading(true)

    try {
      const { data, error } = await recordCapture({})

      if (error) {
        alert(`Error: ${error.message}`)
        return
      }

      if (data && data.success) {
        alert(data.message)
      }
    } catch (error) {
      console.error('Capture error:', error)
      alert('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleCapture}
      disabled={loading || !isDoubleDigits()}
      className="bg-green-600 hover:bg-green-700 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed"
      title={!isDoubleDigits() ? 'Only available during twin time (e.g. 11:11, 23:23)' : 'Capture this moment!'}
    >
      {loading ? 'SAVING...' : 'SAVE'}
    </Button>
  )
}
