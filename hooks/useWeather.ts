import { useQuery } from '@tanstack/react-query'
import { useState, useEffect } from 'react'

export interface WeatherData {
  current: {
    time: string
    temperature_2m: number
    relative_humidity_2m: number
    wind_speed_10m: number
    weather_code: number
  }
  hourly: {
    time: string[]
    temperature_2m: number[]
    weather_code: number[]
  }
  daily: {
    time: string[]
    temperature_2m_max: number[]
    temperature_2m_min: number[]
    weather_code: number[]
    precipitation_sum: number[]
  }
}

interface Location {
  latitude: number
  longitude: number
}

const WEATHER_CODES = {
  0: { icon: '☀️', description: 'Clear sky' },
  1: { icon: '🌤️', description: 'Mainly clear' },
  2: { icon: '⛅', description: 'Partly cloudy' },
  3: { icon: '☁️', description: 'Overcast' },
  45: { icon: '🌫️', description: 'Foggy' },
  48: { icon: '🌫️', description: 'Depositing rime fog' },
  51: { icon: '🌦️', description: 'Light drizzle' },
  53: { icon: '🌦️', description: 'Moderate drizzle' },
  55: { icon: '🌦️', description: 'Dense drizzle' },
  61: { icon: '🌧️', description: 'Slight rain' },
  63: { icon: '🌧️', description: 'Moderate rain' },
  65: { icon: '🌧️', description: 'Heavy rain' },
  71: { icon: '🌨️', description: 'Slight snow' },
  73: { icon: '🌨️', description: 'Moderate snow' },
  75: { icon: '🌨️', description: 'Heavy snow' },
  77: { icon: '🌨️', description: 'Snow grains' },
  80: { icon: '🌦️', description: 'Slight rain showers' },
  81: { icon: '🌦️', description: 'Moderate rain showers' },
  82: { icon: '🌦️', description: 'Violent rain showers' },
  85: { icon: '🌨️', description: 'Slight snow showers' },
  86: { icon: '🌨️', description: 'Heavy snow showers' },
  95: { icon: '⛈️', description: 'Thunderstorm' },
  96: { icon: '⛈️', description: 'Thunderstorm with slight hail' },
  99: { icon: '⛈️', description: 'Thunderstorm with heavy hail' },
}

export function getWeatherInfo(code: number) {
  return WEATHER_CODES[code as keyof typeof WEATHER_CODES] || { icon: '❓', description: 'Unknown' }
}

async function fetchWeatherData(location: Location): Promise<WeatherData> {
  const { latitude, longitude } = location
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&hourly=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_sum&forecast_days=14&timezone=auto`
  
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Weather API error: ${response.status}`)
  }
  
  return response.json()
}

function useGeolocation() {
  const [location, setLocation] = useState<Location | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser')
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
        setLoading(false)
      },
      (error) => {
        setError(`Location error: ${error.message}`)
        setLoading(false)
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 600000, // 10 minutes
      }
    )
  }, [])

  return { location, error, loading }
}

export function useWeather() {
  const { location, error: locationError, loading: locationLoading } = useGeolocation()

  const weatherQuery = useQuery({
    queryKey: ['weather', location?.latitude, location?.longitude],
    queryFn: () => fetchWeatherData(location!),
    enabled: !!location,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
  })

  return {
    weather: weatherQuery.data,
    loading: locationLoading || weatherQuery.isLoading,
    error: locationError || weatherQuery.error?.message,
    refetch: weatherQuery.refetch,
  }
}

export function getDailyWeatherForDate(weather: WeatherData | undefined, date: Date) {
  if (!weather?.daily) return null

  const targetDateStr = date.toISOString().split('T')[0] // YYYY-MM-DD format
  const dayIndex = weather.daily.time.findIndex(time => time === targetDateStr)
  
  if (dayIndex === -1) return null

  return {
    date: targetDateStr,
    maxTemp: Math.round(weather.daily.temperature_2m_max[dayIndex]),
    minTemp: Math.round(weather.daily.temperature_2m_min[dayIndex]),
    weatherCode: weather.daily.weather_code[dayIndex],
    precipitation: weather.daily.precipitation_sum[dayIndex],
    weatherInfo: getWeatherInfo(weather.daily.weather_code[dayIndex])
  }
}