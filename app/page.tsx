'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SenseiLogoWithText } from '@/components/ui/logo'
import Link from 'next/link'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (user) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-sm mx-auto relative">
        <div className="absolute -top-20 left-1/2 transform -translate-x-1/2">
          <SenseiLogoWithText size="md" className="justify-center" />
        </div>
          <Card className="shadow-lg border bg-card">
            <CardHeader className="text-center space-y-4 p-6">
              <CardTitle className="text-2xl md:text-3xl font-bold text-foreground">
                Welcome
              </CardTitle>
              <CardDescription className="text-base md:text-lg text-muted-foreground">
                Manage your tasks efficiently
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-6 pt-0">
              <div className="space-y-3">
                <Button asChild className="w-full h-12 md:h-14 bg-primary text-primary-foreground hover:bg-primary/90 text-base md:text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]">
                  <Link href="/login">🔐 Sign In</Link>
                </Button>
                <Button asChild variant="outline" className="w-full h-12 md:h-14 border-2 text-base md:text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]">
                  <Link href="/register">📝 Create Account</Link>
                </Button>
              </div>
              <div className="text-center text-sm md:text-base text-muted-foreground mt-4">
Start organizing your tasks today
              </div>
            </CardContent>
          </Card>
      </div>
    </div>
  )
}