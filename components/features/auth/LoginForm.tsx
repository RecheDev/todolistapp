'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import { loginSchema, type LoginFormData, validateWithSchema } from '@/lib/validations'
import Link from 'next/link'
import { AuthErrorBoundary } from '@/components/ui/feature-error-boundaries'

function LoginFormInternal() {
  const [email, setEmail] = useState('demo@todoapp.com')
  const [password, setPassword] = useState('demo123')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({})
  const { signIn } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setFieldErrors({})

    // Validate form data
    const validation = validateWithSchema(loginSchema, { email, password })
    if (!validation.success) {
      const errors: Partial<Record<keyof LoginFormData, string>> = {}
      validation.errors.forEach(error => {
        if (error.includes('email')) errors.email = error
        if (error.includes('password')) errors.password = error
      })
      setFieldErrors(errors)
      setLoading(false)
      toast.error('Please fix the errors in the form')
      return
    }

    try {
      await signIn(validation.data.email, validation.data.password)
      toast.success('Welcome back!', {
        description: 'You have successfully signed in'
      })
      router.push('/dashboard')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(errorMessage)
      toast.error('Sign in error', {
        description: errorMessage
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full shadow-lg border-border bg-background">
      <CardHeader className="space-y-4 p-6">
        <CardTitle className="text-2xl md:text-3xl text-center font-bold text-foreground">Sign In</CardTitle>
        <CardDescription className="text-center text-base md:text-lg text-muted-foreground">
          Use the demo credentials to access
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                // Clear field error on change
                if (fieldErrors.email) {
                  setFieldErrors(prev => ({ ...prev, email: undefined }))
                }
              }}
              required
              disabled={loading}
              autoComplete="email"
              className={`h-12 md:h-12 text-base border-2 transition-all duration-200 ${
                fieldErrors.email 
                  ? 'border-red-500 focus:border-red-500 bg-red-50 dark:bg-red-900/10' 
                  : 'focus:border-primary'
              }`}
              aria-describedby={fieldErrors.email ? "email-error" : error ? "login-error" : undefined}
              aria-invalid={fieldErrors.email ? "true" : "false"}
            />
            {fieldErrors.email && (
              <p id="email-error" className="text-sm text-red-600 dark:text-red-400" role="alert">
                {fieldErrors.email}
              </p>
            )}
          </div>
          <div className="space-y-3">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                // Clear field error on change
                if (fieldErrors.password) {
                  setFieldErrors(prev => ({ ...prev, password: undefined }))
                }
              }}
              required
              disabled={loading}
              autoComplete="current-password"
              className={`h-12 md:h-12 text-base border-2 transition-all duration-200 ${
                fieldErrors.password 
                  ? 'border-red-500 focus:border-red-500 bg-red-50 dark:bg-red-900/10' 
                  : 'focus:border-primary'
              }`}
              aria-describedby={fieldErrors.password ? "password-error" : error ? "login-error" : undefined}
              aria-invalid={fieldErrors.password ? "true" : "false"}
            />
            {fieldErrors.password && (
              <p id="password-error" className="text-sm text-red-600 dark:text-red-400" role="alert">
                {fieldErrors.password}
              </p>
            )}
          </div>
          {error && (
            <div 
              className="text-sm text-destructive bg-destructive/10 p-3 rounded-md"
              role="alert"
              aria-live="polite"
              id="login-error"
            >
              {error}
            </div>
          )}
          <div className="bg-primary/5 dark:bg-primary/10 p-4 rounded-lg text-sm border border-primary/20 dark:border-primary/30">
            <p className="font-semibold text-foreground mb-2">Demo Credentials:</p>
            <p className="text-foreground font-medium">📧 demo@todoapp.com</p>
            <p className="text-foreground font-medium">🔑 demo123</p>
          </div>
          <Button 
            type="submit" 
            className="w-full h-12 md:h-14 text-base md:text-lg font-semibold bg-primary hover:bg-primary/90 active:bg-primary/80 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-lg" 
            disabled={loading}
            aria-describedby={loading ? "loading-status" : undefined}
          >
            {loading ? '⏳ Signing in...' : '🚀 Sign In'}
          </Button>
          {loading && (
            <div id="loading-status" className="sr-only" aria-live="polite">
              Signing in, please wait...
            </div>
          )}
        </form>
        <div className="mt-6 text-center text-sm">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
            Create account
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

export function LoginForm() {
  return (
    <AuthErrorBoundary>
      <LoginFormInternal />
    </AuthErrorBoundary>
  )
}