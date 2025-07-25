'use client'

import { Badge } from '@/components/ui/badge'
import { useWeather, getWeatherInfo } from '@/hooks/useWeather'
import { Skeleton } from '@/components/ui/skeleton'

export function WeatherWidget() {
  const { weather, loading, error } = useWeather()

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="h-6 w-8" />
        <Skeleton className="h-6 w-12" />
      </div>
    )
  }

  if (error) {
    return (
      <Badge variant="outline" className="text-xs text-muted-foreground">
        Weather unavailable
      </Badge>
    )
  }

  if (!weather?.current) {
    return null
  }

  const { current } = weather
  const weatherInfo = getWeatherInfo(current.weather_code)
  const temp = Math.round(current.temperature_2m)

  return (
    <Badge variant="outline" className="flex items-center gap-1 text-xs">
      <span className="text-sm">{weatherInfo.icon}</span>
      <span>{temp}°C</span>
    </Badge>
  )
}