'use client'

import { useCallback, useRef } from 'react'

// Debounce hook to prevent rapid interactions that cause INP issues
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useDebounceCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)
  
  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    timeoutRef.current = setTimeout(() => {
      callback(...args)
    }, delay)
  }, [callback, delay]) as T
}

// Throttle hook for high-frequency events like drag operations
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useThrottleCallback<T extends (...args: any[]) => any>(
  callback: T,
  limit: number
): T {
  const inThrottle = useRef<boolean>(false)
  
  return useCallback((...args: Parameters<T>) => {
    if (!inThrottle.current) {
      callback(...args)
      inThrottle.current = true
      setTimeout(() => {
        inThrottle.current = false
      }, limit)
    }
  }, [callback, limit]) as T
}