'use client'

import { useState, useRef, useEffect, ReactNode } from 'react'

interface LazyContentProps {
  children: ReactNode
  fallback?: ReactNode
  threshold?: number
  rootMargin?: string
  className?: string
}

export function LazyContent({ 
  children, 
  fallback = null, 
  threshold = 0.1,
  rootMargin = '100px',
  className
}: LazyContentProps) {
  const [isInView, setIsInView] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { threshold, rootMargin }
    )

    if (contentRef.current) {
      observer.observe(contentRef.current)
    }

    return () => observer.disconnect()
  }, [threshold, rootMargin])

  return (
    <div ref={contentRef} className={className}>
      {isInView ? children : fallback}
    </div>
  )
}

