'use client'

import { Component, ErrorInfo, ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RefreshCw, AlertTriangle, Home, Bug } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  resetKeys?: Array<string | number>
  resetOnPropsChange?: boolean
  showReloadOption?: boolean
  showHomeOption?: boolean
  level?: 'page' | 'component' | 'root'
  name?: string
}

interface State {
  hasError: boolean
  error: Error | null
  retryCount: number
  errorBoundaryId: string
}

const MAX_RETRY_COUNT = 3
const RETRY_DELAY = 1000

export class ErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: number | null = null
  private prevResetKeys: Array<string | number>

  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      retryCount: 0,
      errorBoundaryId: Math.random().toString(36).substr(2, 9),
    }
    this.prevResetKeys = props.resetKeys || []
  }

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorDetails = {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorBoundary: this.props.name || 'Unknown',
      level: this.props.level || 'component',
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Unknown',
      url: typeof window !== 'undefined' ? window.location.href : 'Unknown',
    }

    // Log error with context
    console.group(`🚨 Error Boundary: ${this.props.name || 'Unnamed'}`)
    console.error('Error:', error)
    console.error('Error Info:', errorInfo)
    console.error('Error Details:', errorDetails)
    console.groupEnd()

    // Call custom error handler
    this.props.onError?.(error, errorInfo)

    // Auto-retry for component-level errors (not page-level)
    if (this.props.level === 'component' && this.state.retryCount < MAX_RETRY_COUNT) {
      this.scheduleRetry()
    }
  }

  public componentDidUpdate(prevProps: Props) {
    const { resetKeys, resetOnPropsChange } = this.props
    const { hasError } = this.state

    if (hasError && resetOnPropsChange && prevProps.children !== this.props.children) {
      this.resetErrorBoundary()
    }

    if (hasError && resetKeys && prevProps.resetKeys !== resetKeys) {
      if (resetKeys.some((key, idx) => prevProps.resetKeys?.[idx] !== key)) {
        this.resetErrorBoundary()
      }
    }
  }

  public componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId)
    }
  }

  private scheduleRetry = () => {
    this.resetTimeoutId = window.setTimeout(() => {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        retryCount: prevState.retryCount + 1,
      }))
    }, RETRY_DELAY * (this.state.retryCount + 1))
  }

  private resetErrorBoundary = () => {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId)
      this.resetTimeoutId = null
    }
    this.setState({
      hasError: false,
      error: null,
      retryCount: 0,
    })
  }

  private handleRetry = () => {
    this.resetErrorBoundary()
  }

  private handleReload = () => {
    window.location.reload()
  }

  private handleGoHome = () => {
    window.location.href = '/dashboard'
  }

  private renderErrorUI() {
    const { level = 'component', name, showReloadOption = true, showHomeOption = false } = this.props
    const { error, retryCount } = this.state
    
    const isPageLevel = level === 'page' || level === 'root'
    const canRetry = retryCount < MAX_RETRY_COUNT
    const isAutoRetrying = level === 'component' && canRetry

    // Minimal error UI for component-level errors
    if (level === 'component') {
      return (
        <div className="border border-destructive/20 rounded-lg p-4 bg-destructive/5">
          <div className="flex items-center gap-2 text-destructive mb-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">
              {name ? `${name} Error` : 'Component Error'}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            {isAutoRetrying ? 
              `Auto-retrying... (${retryCount}/${MAX_RETRY_COUNT})` :
              'This component encountered an error and stopped working.'
            }
          </p>
          {!isAutoRetrying && (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={this.handleRetry}
              className="h-8 text-xs"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          )}
        </div>
      )
    }

    // Full error UI for page-level errors
    const containerClass = isPageLevel 
      ? "min-h-screen flex items-center justify-center bg-background px-4"
      : "w-full flex items-center justify-center p-8"

    return (
      <div className={containerClass}>
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-destructive flex items-center justify-center gap-2">
              <AlertTriangle className="h-6 w-6" />
              {isPageLevel ? 'Page Error' : 'Something went wrong'}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              {name ? `The ${name} encountered an error. ` : ''}
              {isPageLevel 
                ? 'This page is temporarily unavailable. Please try again or go back to the dashboard.'
                : 'This section encountered an error and stopped working properly.'
              }
            </p>
            
            {process.env.NODE_ENV === 'development' && error && (
              <details className="text-left text-xs border rounded p-2 bg-muted/30">
                <summary className="cursor-pointer font-medium mb-2 flex items-center gap-1">
                  <Bug className="h-3 w-3" />
                  Error details (dev only)
                </summary>
                <div className="space-y-2">
                  <div>
                    <strong>Error:</strong>
                    <pre className="mt-1 p-2 bg-background rounded text-xs overflow-auto">
                      {error.message}
                    </pre>
                  </div>
                  {error.stack && (
                    <div>
                      <strong>Stack trace:</strong>
                      <pre className="mt-1 p-2 bg-background rounded text-xs overflow-auto max-h-32">
                        {error.stack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                onClick={this.handleRetry}
                className="flex-1"
                variant="default"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              
              {showReloadOption && (
                <Button 
                  onClick={this.handleReload}
                  variant="outline"
                  className="flex-1"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reload Page
                </Button>
              )}
              
              {showHomeOption && (
                <Button 
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="flex-1"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  public render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }
      
      return this.renderErrorUI()
    }

    return this.props.children
  }
}

// Higher-order component for easier usage
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  return WrappedComponent
}

// Hook for manually triggering error boundaries (useful for async errors)
export function useErrorHandler() {
  return (error: Error) => {
    // This will be caught by the nearest error boundary
    throw error
  }
}