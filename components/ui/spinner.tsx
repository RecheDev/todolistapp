import * as React from "react"
import { cn } from "@/lib/utils"

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

function Spinner({ size = 'md', className }: SpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-[1.5px]',
    md: 'h-6 w-6 border-2', 
    lg: 'h-8 w-8 border-2'
  }
  
  return (
    <div 
      className={cn(
        "animate-spin rounded-full border-primary border-b-transparent transition-all duration-200",
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="Loading"
    />
  )
}

export { Spinner }

