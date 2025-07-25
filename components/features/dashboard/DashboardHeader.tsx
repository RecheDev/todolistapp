import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { WeatherWidget } from '@/components/features/weather/WeatherWidget'
import { LogOut, Calendar, BarChart3 } from 'lucide-react'
import Link from 'next/link'

interface DashboardHeaderProps {
  stats: {
    total: number
    pending: number
    completed: number
  }
  isOnline: boolean
  userEmail?: string
  onLogout: () => void
}

export function DashboardHeader({ stats, isOnline, userEmail, onLogout }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b-2 border-border bg-background/80 backdrop-blur-lg accent-border-top">
      <div className="px-6 flex h-20 items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-primary">
            📋 My Tasks
          </h1>
          <div className="hidden sm:flex items-center gap-3">
            <WeatherWidget />
            <Badge variant="outline" className="text-sm font-semibold px-3 py-1">{stats.total} total</Badge>
            <Badge variant="default" className="text-sm font-semibold px-3 py-1">{stats.pending} pending</Badge>
            <Badge variant="secondary" className="text-sm font-semibold px-3 py-1">{stats.completed} completed</Badge>
            {!isOnline && (
              <Badge variant="destructive" className="animate-pulse text-sm font-semibold px-3 py-1">
                Offline
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/calendar">
            <Button 
              variant="ghost" 
              size="sm"
              className="h-10 px-4 text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200"
            >
              <Calendar className="h-4 w-4 mr-2" />
              <span className="text-sm hidden sm:inline">Calendar</span>
            </Button>
          </Link>
          <Link href="/stats">
            <Button 
              variant="ghost" 
              size="sm"
              className="h-10 px-4 text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              <span className="text-sm hidden sm:inline">Statistics</span>
            </Button>
          </Link>
          <span className="text-sm hidden md:inline font-medium bg-muted/30 px-3 py-1 rounded text-secondary-foreground">
            {userEmail}
          </span>
          <ThemeToggle />
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onLogout}
            className="h-10 px-4 text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200"
          >
            <LogOut className="h-4 w-4 mr-2" />
            <span className="text-sm">Sign Out</span>
          </Button>
        </div>
      </div>
    </header>
  )
}