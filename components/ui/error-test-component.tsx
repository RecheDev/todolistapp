'use client'

import { useState } from 'react'
import { Button } from './button'
import { Card, CardContent, CardHeader, CardTitle } from './card'

// Test component to trigger different types of errors for testing error boundaries
export function ErrorTestComponent() {
  const [throwError, setThrowError] = useState(false)

  // Synchronous error for testing
  if (throwError) {
    throw new Error('Test error: This is a simulated component error for testing error boundaries')
  }

  // Async error simulation
  const handleAsyncError = async () => {
    try {
      // Simulate an async operation that fails
      await new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Async operation failed')), 1000)
      })
    } catch (error) {
      // This won't be caught by error boundary, need to use error handler hook
      console.error('Async error:', error)
      throw error
    }
  }

  const handleRenderError = () => {
    setThrowError(true)
  }

  const handleNullReferenceError = () => {
    // This will cause a runtime error
    const obj = null as unknown as Record<string, unknown>
    console.log(obj.property)
  }

  if (process.env.NODE_ENV !== 'development') {
    return null // Only show in development
  }

  return (
    <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10 dark:border-yellow-800">
      <CardHeader>
        <CardTitle className="text-yellow-800 dark:text-yellow-200 text-sm">
          🧪 Error Boundary Test (Dev Only)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-xs text-yellow-700 dark:text-yellow-300 mb-3">
          Use these buttons to test error boundary functionality:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleRenderError}
            className="text-xs h-8 border-red-200 text-red-700 hover:bg-red-50"
          >
            Render Error
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleNullReferenceError}
            className="text-xs h-8 border-red-200 text-red-700 hover:bg-red-50"
          >
            Null Reference
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleAsyncError}
            className="text-xs h-8 border-red-200 text-red-700 hover:bg-red-50"
          >
            Async Error
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}