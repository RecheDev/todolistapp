'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export function RegisterForm() {

  return (
    <Card className="w-full shadow-lg border-border bg-background">
      <CardHeader className="space-y-4 p-6">
        <CardTitle className="text-2xl md:text-3xl text-center font-bold text-foreground">Create Account</CardTitle>
        <CardDescription className="text-center text-base md:text-lg text-muted-foreground">
          For this demo, use the provided credentials
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className="space-y-4">
          <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-md border border-amber-200 dark:border-amber-700">
            <h3 className="font-medium text-amber-900 dark:text-amber-100 mb-2">
              🚀 Portfolio Demo
            </h3>
            <p className="text-sm text-amber-800 dark:text-amber-200 mb-3">
              This is a portfolio demo application. No need to create a real account.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
              <p className="font-medium text-blue-900 dark:text-blue-100 mb-2">Demo Credentials:</p>
              <p className="text-blue-700 dark:text-blue-300">📧 demo@todoapp.com</p>
              <p className="text-blue-700 dark:text-blue-300">🔑 demo123</p>
            </div>
          </div>
          
          <Button asChild className="w-full h-12 md:h-14 text-base md:text-lg font-semibold bg-primary hover:bg-primary/90 active:bg-primary/80 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]">
            <Link href="/login">
              🔐 Go to Login with Demo Credentials
            </Link>
          </Button>
        </div>
        
        <div className="mt-6 text-center text-sm">
          Already have the credentials?{' '}
          <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}