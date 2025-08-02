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
  let consoleGroup: jest.SpyInstance

  beforeEach(() => {
    // Mock console methods to avoid noise in test output
    consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
    consoleGroup = jest.spyOn(console, 'group').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleError.mockRestore()
    consoleGroup.mockRestore()
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

    expect(screen.getByText(/test component error/i)).toBeInTheDocument()
    expect(screen.getByText(/auto-retrying/i)).toBeInTheDocument()
  })

  it('renders generic error message for unnamed boundaries', () => {
    render(
      <ErrorBoundary level="component">
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText(/component error/i)).toBeInTheDocument()
    expect(screen.getByText(/auto-retrying/i)).toBeInTheDocument()
  })

  it('shows auto-retry behavior for component errors', () => {
    render(
      <ErrorBoundary level="component" name="Test Component">
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    // Should show error initially with auto-retry
    expect(screen.getByText(/test component error/i)).toBeInTheDocument()
    expect(screen.getByText(/auto-retrying/i)).toBeInTheDocument()
  })

  it('shows detailed error in development mode for page-level errors', () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'

    render(
      <ErrorBoundary level="page" name="Test Component">
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    // Check for error details section in page-level error UI
    expect(screen.getByText(/error details/i)).toBeInTheDocument()
    
    // Check that error message is present (there might be multiple instances)
    const errorMessages = screen.getAllByText(/test error message/i)
    expect(errorMessages.length).toBeGreaterThan(0)

    process.env.NODE_ENV = originalEnv
  })

  it('handles page-level errors differently', () => {
    render(
      <ErrorBoundary level="page" name="Test Page">
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(screen.getByText(/page error/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reload page/i })).toBeInTheDocument()
  })

  it('logs errors to console with component information', () => {
    render(
      <ErrorBoundary level="component" name="Test Component">
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    )

    expect(consoleGroup).toHaveBeenCalledWith('🚨 Error Boundary: Test Component')
  })
})

describe('withErrorBoundary HOC', () => {
  let consoleError: jest.SpyInstance
  let consoleGroup: jest.SpyInstance

  beforeEach(() => {
    consoleError = jest.spyOn(console, 'error').mockImplementation(() => {})
    consoleGroup = jest.spyOn(console, 'group').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleError.mockRestore()
    consoleGroup.mockRestore()
  })

  it('wraps component with error boundary', () => {
    const TestComponent = () => <div>Test content</div>
    const WrappedComponent = withErrorBoundary(TestComponent, {
      level: 'component',
      name: 'Wrapped Component'
    })

    render(<WrappedComponent />)

    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('catches errors in wrapped component', () => {
    const WrappedThrowError = withErrorBoundary(ThrowError, {
      level: 'component',
      name: 'Wrapped Error Component'
    })

    render(<WrappedThrowError shouldThrow={true} />)

    expect(screen.getByText(/wrapped error component error/i)).toBeInTheDocument()
    expect(screen.getByText(/auto-retrying/i)).toBeInTheDocument()
  })

  it('forwards props correctly', () => {
    const TestComponent = ({ message }: { message: string }) => <div>{message}</div>
    const WrappedComponent = withErrorBoundary(TestComponent, {
      level: 'component',
      name: 'Props Test'
    })

    render(<WrappedComponent message="Hello World" />)

    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })
})