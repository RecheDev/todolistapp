'use client'

import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8', 
  lg: 'w-12 h-12',
  xl: 'w-16 h-16'
}

export function SenseiLogo({ className, size = 'md' }: LogoProps) {
  return (
    <div className={cn('relative', sizeClasses[size], className)}>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Ninja mask - main shape */}
        <path
          d="M50 10 C35 10, 20 20, 20 35 L20 65 C20 80, 35 90, 50 90 C65 90, 80 80, 80 65 L80 35 C80 20, 65 10, 50 10 Z"
          className="fill-primary"
        />
        
        {/* Eye area - lighter shade */}
        <path
          d="M25 30 L75 30 L75 50 C75 55, 70 60, 65 60 L35 60 C30 60, 25 55, 25 50 Z"
          className="fill-primary/20"
        />
        
        {/* Eyes */}
        <circle
          cx="37"
          cy="42"
          r="4"
          className="fill-primary-foreground"
        />
        <circle
          cx="63"
          cy="42"
          r="4"
          className="fill-primary-foreground"
        />
        
        {/* Ninja headband */}
        <rect
          x="20"
          y="25"
          width="60"
          height="8"
          rx="4"
          className="fill-primary/80"
        />
        
        {/* Headband knot */}
        <circle
          cx="85"
          cy="29"
          r="3"
          className="fill-primary/80"
        />
        
        {/* Subtle check mark for productivity */}
        <path
          d="M42 70 L47 75 L58 64"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-primary-foreground/60"
          fill="none"
        />
      </svg>
    </div>
  )
}

export function SenseiLogoWithText({ className, size = 'md' }: LogoProps) {
  const textSizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl', 
    xl: 'text-4xl'
  }

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <SenseiLogo size={size} />
      <span className={cn('font-bold text-primary', textSizes[size])}>
        SenseiNotes
      </span>
    </div>
  )
}