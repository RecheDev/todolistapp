'use client'

import { ReactNode } from 'react'
import { ErrorBoundary } from './error-boundary'
import { toast } from 'sonner'
import { RefreshCw, AlertTriangle, ShoppingCart, Plus, Search } from 'lucide-react'
import { Button } from './button'

// Todo-specific error boundary
export function TodoErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      name="Todo Management"
      level="component"
      onError={(error, errorInfo) => {
        // Log todo-specific error details
        console.error('Todo Error:', {
          error: error.message,
          component: errorInfo.componentStack,
          timestamp: new Date().toISOString(),
        })
        
        toast.error('Todo operation failed. Please try again.', {
          duration: 4000,
          action: {
            label: 'Refresh',
            onClick: () => window.location.reload()
          }
        })
      }}
      fallback={
        <div className="border border-destructive/20 rounded-lg p-6 bg-destructive/5 text-center">
          <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-3" />
          <h3 className="font-medium text-destructive mb-2">Todo Loading Error</h3>
          <p className="text-sm text-muted-foreground mb-4">
            There was a problem loading your todos. This might be a temporary issue.
          </p>
          <Button 
            size="sm" 
            onClick={() => window.location.reload()}
            className="mx-auto"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Todos
          </Button>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  )
}

// Shopping list specific error boundary
export function ShoppingListErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      name="Shopping List"
      level="component"
      onError={() => {
        toast.error('Shopping list error. Please try again.', {
          duration: 3000,
          icon: <ShoppingCart className="h-4 w-4" />
        })
      }}
      fallback={
        <div className="border border-destructive/20 rounded-lg p-4 bg-destructive/5 text-center">
          <ShoppingCart className="h-6 w-6 text-destructive mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Shopping list temporarily unavailable
          </p>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  )
}

// Authentication error boundary
export function AuthErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      name="Authentication"
      level="component"
      showHomeOption={true}
      onError={(error) => {
        // Handle auth-specific errors
        if (error.message.includes('token') || error.message.includes('auth')) {
          toast.error('Authentication error. Please log in again.', {
            duration: 5000,
            action: {
              label: 'Login',
              onClick: () => window.location.href = '/login'
            }
          })
        } else {
          toast.error('Authentication system error.')
        }
      }}
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
          <div className="text-center space-y-4">
            <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
            <h2 className="text-xl font-semibold text-destructive">Authentication Error</h2>
            <p className="text-muted-foreground max-w-md">
              There was a problem with the authentication system. Please try logging in again.
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => window.location.href = '/login'}>
                Go to Login
              </Button>
              <Button variant="outline" onClick={() => window.location.reload()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  )
}

// Add Todo form error boundary
export function AddTodoErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      name="Add Todo Form"
      level="component"
      onError={() => {
        toast.error('Error with todo form. Please refresh and try again.', {
          duration: 4000,
        })
      }}
      fallback={
        <div className="border border-destructive/20 rounded-lg p-4 bg-destructive/5 text-center">
          <Plus className="h-6 w-6 text-destructive mx-auto mb-2" />
          <p className="text-sm font-medium text-destructive mb-1">Form Error</p>
          <p className="text-xs text-muted-foreground mb-3">
            The add todo form encountered an error
          </p>
          <Button size="sm" variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="h-3 w-3 mr-1" />
            Refresh
          </Button>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  )
}

// Search and filter error boundary
export function SearchErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      name="Search & Filter"
      level="component"
      onError={() => {
        toast.error('Search functionality temporarily unavailable.', {
          duration: 3000,
        })
      }}
      fallback={
        <div className="border border-destructive/20 rounded-lg p-3 bg-destructive/5 text-center">
          <Search className="h-5 w-5 text-destructive mx-auto mb-1" />
          <p className="text-xs text-muted-foreground">
            Search temporarily unavailable
          </p>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  )
}

// Dashboard page-level error boundary
export function DashboardErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      name="Dashboard"
      level="page"
      showHomeOption={false}
      showReloadOption={true}
      onError={(error, errorInfo) => {
        console.error('Dashboard Error:', {
          error: error.message,
          componentStack: errorInfo.componentStack,
          timestamp: new Date().toISOString(),
        })
        
        toast.error('Dashboard encountered an error. Please refresh the page.', {
          duration: 5000,
          action: {
            label: 'Refresh',
            onClick: () => window.location.reload()
          }
        })
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

// Calendar page error boundary
export function CalendarErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      name="Calendar"
      level="page"
      showHomeOption={true}
      onError={() => {
        toast.error('Calendar page error. Please try again.', {
          duration: 4000,
        })
      }}
    >
      {children}
    </ErrorBoundary>
  )
}

// Virtual list error boundary (for large datasets)
export function VirtualListErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      name="Virtual List"
      level="component"
      onError={() => {
        toast.error('List display error. Switching to standard view.', {
          duration: 3000,
        })
      }}
      fallback={
        <div className="border border-destructive/20 rounded-lg p-4 bg-destructive/5 text-center">
          <AlertTriangle className="h-6 w-6 text-destructive mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            List view temporarily unavailable. Please refresh to try again.
          </p>
          <Button size="sm" className="mt-2" onClick={() => window.location.reload()}>
            <RefreshCw className="h-3 w-3 mr-1" />
            Refresh
          </Button>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  )
}