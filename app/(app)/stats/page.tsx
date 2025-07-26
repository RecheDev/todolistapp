'use client'

import { useTodos } from '@/hooks/useTodos'
import { useAuth } from '@/hooks/useAuth'
import { StatsBoard } from '@/components/features/dashboard/StatsBoard'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function StatsPage() {
  const { user } = useAuth()
  const { todos } = useTodos()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          <div className="text-sm text-muted-foreground">
            {user?.email}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 md:px-6 md:py-8">
        <StatsBoard todos={todos} />
      </main>
    </div>
  )
}