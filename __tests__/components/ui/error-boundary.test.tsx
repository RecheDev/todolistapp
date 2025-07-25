import React from 'react'
import { render, screen, fireEvent, waitFor } from '../../utils/test-utils'
import { ErrorBoundary, withErrorBoundary } from '@/components/ui/error-boundary'

// Component that throws an error for testing
const ThrowError = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error message')
  }
  return <div>No error</div>
}

// Component that throws async error
const ThrowAsyncError = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  React.useEffect(() => {
    if (shouldThrow) {
      throw new Error('Async test error')
    }
  }, [shouldThrow])
  return <div>No async error</div>
}

describe('ErrorBoundary', () => {
  let consoleError: jest.SpyInstance

  beforeEach(() => {
    // Mock console.error to avoid noise in test output
    consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleError.mockRestore()
  })

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    )

    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('renders error UI when there is an error', () => {
    render(
      <ErrorBoundary level="component" name="Test Component">
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Test Component Error')).toBeInTheDocument()
    expect(screen.getByText(/This component encountered an error/)).toBeInTheDocument()
  })

  it('shows custom fallback when provided', () => {
    const customFallback = <div>Custom error message</div>

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText('Custom error message')).toBeInTheDocument()
  })

  it('shows retry button for component-level errors', () => {
    render(
      <ErrorBoundary level="component" name="Test Component">
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    const retryButton = screen.getByRole('button', { name: /retry/i })
    expect(retryButton).toBeInTheDocument()
  })

  it('shows reload and home buttons for page-level errors', () => {
    render(
      <ErrorBoundary level="page" showHomeOption={true}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByRole('button', { name: /reload page/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /go home/i })).toBeInTheDocument()
  })

  it('calls custom error handler when provided', () => {
    const onError = jest.fn()

    render(
      <ErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String)
      })
    )
  })

  it('shows error details in development mode', () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'

    render(
      <ErrorBoundary level="page">
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText(/Error details/)).toBeInTheDocument()
    
    process.env.NODE_ENV = originalEnv
  })

  it('hides error details in production mode', () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'

    render(
      <ErrorBoundary level="page">
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.queryByText(/Error details/)).not.toBeInTheDocument()
    
    process.env.NODE_ENV = originalEnv
  })

  it('resets error state when retry button is clicked', async () => {
    const TestComponent = () => {
      const [shouldThrow, setShouldThrow] = React.useState(true)
      
      React.useEffect(() => {
        const timer = setTimeout(() => setShouldThrow(false), 100)
        return () => clearTimeout(timer)
      }, [])

      return <ThrowError shouldThrow={shouldThrow} />
    }

    render(
      <ErrorBoundary level="component">
        <TestComponent />
      </ErrorBoundary>
    )

    // Error should be shown initially
    expect(screen.getByText(/Component Error/)).toBeInTheDocument()

    // Click retry button
    const retryButton = screen.getByRole('button', { name: /retry/i })
    fireEvent.click(retryButton)

    // Wait for component to recover
    await waitFor(() => {
      expect(screen.getByText('No error')).toBeInTheDocument()
    })
  })

  it('auto-retries component-level errors', async () => {
    let attemptCount = 0
    const AutoRetryComponent = () => {
      attemptCount++
      if (attemptCount <= 2) {
        throw new Error(`Attempt ${attemptCount} failed`)
      }
      return <div>Success after retries</div>
    }

    render(
      <ErrorBoundary level="component">
        <AutoRetryComponent />
      </ErrorBoundary>
    )

    // Should eventually show success message after auto-retries
    await waitFor(() => {
      expect(screen.getByText('Success after retries')).toBeInTheDocument()
    }, { timeout: 5000 })

    expect(attemptCount).toBeGreaterThan(2)
  })

  it('stops auto-retry after max attempts', async () => {
    let attemptCount = 0
    const AlwaysFailComponent = () => {
      attemptCount++
      throw new Error(`Attempt ${attemptCount} failed`)
    }

    render(
      <ErrorBoundary level="component">
        <AlwaysFailComponent />
      </ErrorBoundary>
    )

    // Wait for max retries to be exhausted
    await waitFor(() => {
      expect(screen.getByText(/Component Error/)).toBeInTheDocument()
    }, { timeout: 10000 })

    // Should have attempted max retries (3) + initial attempt
    expect(attemptCount).toBe(4)
  })

  it('resets error when resetKeys change', () => {
    const TestComponent = ({ resetKey }: { resetKey: string }) => (
      <ErrorBoundary resetKeys={[resetKey]}>
        <ThrowError shouldThrow={resetKey === 'error'} />
      </ErrorBoundary>
    )

    const { rerender } = render(<TestComponent resetKey="error" />)

    // Error should be shown
    expect(screen.getByText(/Something went wrong/)).toBeInTheDocument()

    // Change resetKey to trigger reset
    rerender(<TestComponent resetKey="success" />)

    // Should show no error
    expect(screen.getByText('No error')).toBeInTheDocument()
  })
})

describe('withErrorBoundary HOC', () => {
  it('wraps component with error boundary', () => {
    const TestComponent = () => <div>Test Component</div>
    const WrappedComponent = withErrorBoundary(TestComponent, {
      name: 'Wrapped Component'
    })

    render(<WrappedComponent />)

    expect(screen.getByText('Test Component')).toBeInTheDocument()
  })

  it('catches errors in wrapped component', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
    
    const ErrorComponent = () => {
      throw new Error('Wrapped component error')
    }
    const WrappedComponent = withErrorBoundary(ErrorComponent, {
      name: 'Wrapped Component',
      level: 'component'
    })

    render(<WrappedComponent />)

    expect(screen.getByText('Wrapped Component Error')).toBeInTheDocument()
    
    consoleError.mockRestore()
  })
})