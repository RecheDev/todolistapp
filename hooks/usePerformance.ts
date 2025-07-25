'use client'

import { useCallback, useRef } from 'react'
import type { DebounceCallback, ThrottleCallback } from '@/types/hooks'

// Debounce hook to prevent rapid interactions that cause INP issues
export function useDebounceCallback<TArgs extends readonly unknown[], TReturn = void>(
  callback: DebounceCallback<TArgs, TReturn>,
  delay: number
): DebounceCallback<TArgs, void> {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  
  return useCallback((...args: TArgs) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    timeoutRef.current = setTimeout(() => {
      callback(...args)
    }, delay)
  }, [callback, delay])
}

// Throttle hook for high-frequency events like drag operations
export function useThrottleCallback<TArgs extends readonly unknown[], TReturn = void>(
  callback: ThrottleCallback<TArgs, TReturn>,
  limit: number
): ThrottleCallback<TArgs, void> {
  const inThrottle = useRef<boolean>(false)
  
  return useCallback((...args: TArgs) => {
    if (!inThrottle.current) {
      callback(...args)
      inThrottle.current = true
      setTimeout(() => {
        inThrottle.current = false
      }, limit)
    }
  }, [callback, limit])
}

// Performance measurement hook
export function usePerformanceMonitor(componentName: string) {
  const startTime = useRef<number>(0)
  const renderCount = useRef<number>(0)
  
  const startMeasure = useCallback(() => {
    startTime.current = performance.now()
  }, [])
  
  const endMeasure = useCallback(() => {
    if (startTime.current) {
      const duration = performance.now() - startTime.current
      renderCount.current += 1
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Performance] ${componentName}: ${duration.toFixed(2)}ms (render #${renderCount.current})`)
      }
      
      return duration
    }
    return 0
  }, [componentName])
  
  return { startMeasure, endMeasure, renderCount: renderCount.current }
}