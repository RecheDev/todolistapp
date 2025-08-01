'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    // Check initial status
    setIsOnline(navigator.onLine)

    const handleOnline = () => {
      setIsOnline(true)
      toast.success('🟢 Back online!', {
        duration: 3000,
      })
    }

    const handleOffline = () => {
      setIsOnline(false)
      toast.error('🔴 You are offline. Changes will sync when reconnected.', {
        duration: 5000,
      })
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return { isOnline }
}

