'use client'

import { getDailyWeatherForDate } from '@/hooks/useWeather'
import { cn } from '@/lib/utils'
import type { WeatherData } from '@/hooks/useWeather'

interface CalendarWeatherDisplayProps {
  date: Date
  weather?: WeatherData
  isSelected?: boolean
  compact?: boolean
}

export function CalendarWeatherDisplay({ 
  date, 
  weather, 
  isSelected = false, 
  compact = false 
}: CalendarWeatherDisplayProps) {
  const dailyWeather = getDailyWeatherForDate(weather, date)
  
  if (!dailyWeather) return null

  const { weatherInfo, maxTemp, minTemp, precipitation } = dailyWeather
  const hasRain = precipitation > 0.1 // Show rain if > 0.1mm

  if (compact) {
    return (
      <div className="flex items-center gap-1 text-xs mt-1">
        <span className="text-xs">{weatherInfo.icon}</span>
        <span className={cn(
          "text-xs",
          isSelected ? "text-primary-foreground" : "text-muted-foreground"
        )}>
          {maxTemp}°
        </span>
        {hasRain && (
          <span className={cn(
            "text-xs",
            isSelected ? "text-primary-foreground" : "text-blue-600 dark:text-blue-400"
          )}>
            💧
          </span>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1 w-full mt-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className="text-sm">{weatherInfo.icon}</span>
          <span className={cn(
            "text-xs font-medium",
            isSelected ? "text-primary-foreground" : "text-foreground"
          )}>
            {maxTemp}°/{minTemp}°
          </span>
        </div>
        {hasRain && (
          <div className={cn(
            "text-xs px-1 py-0.5 rounded flex items-center gap-1",
            isSelected 
              ? "bg-primary-foreground/20 text-primary-foreground" 
              : "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200"
          )}>
            <span>💧</span>
            <span>{precipitation.toFixed(1)}mm</span>
          </div>
        )}
      </div>
      
      {weatherInfo.description.includes('rain') || weatherInfo.description.includes('storm') || hasRain ? (
        <div className={cn(
          "text-xs px-1 py-0.5 rounded text-center font-medium",
          isSelected 
            ? "bg-primary-foreground/20 text-primary-foreground" 
            : "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200"
        )}>
          {weatherInfo.description.includes('storm') ? '⛈️ Storm' : '🌧️ Rain expected'}
        </div>
      ) : null}
    </div>
  )
}