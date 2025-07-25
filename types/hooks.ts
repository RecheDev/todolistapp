// Generic function type with unknown arguments and return value
export type AnyFunction = (...args: unknown[]) => unknown

// More specific function types for common use cases
export type VoidFunction = (...args: unknown[]) => void
export type AsyncFunction<T = unknown> = (...args: unknown[]) => Promise<T>

// Callback types for performance hooks
export type DebounceCallback<TArgs extends readonly unknown[] = unknown[], TReturn = void> = 
  (...args: TArgs) => TReturn

export type ThrottleCallback<TArgs extends readonly unknown[] = unknown[], TReturn = void> = 
  (...args: TArgs) => TReturn

// Event handler types
export type EventHandler<TEvent = Event> = (event: TEvent) => void
export type ChangeHandler<TValue = unknown> = (value: TValue) => void

// Generic async operation result
export interface AsyncOperationResult<TData = unknown, TError = Error> {
  data?: TData
  error?: TError
  isLoading: boolean
  isSuccess: boolean
  isError: boolean
}

// Hook return types
export interface UseAsyncState<TData = unknown, TError = Error> {
  data: TData | undefined
  error: TError | null
  isLoading: boolean
  isSuccess: boolean
  isError: boolean
  execute: (...args: unknown[]) => Promise<void>
  reset: () => void
}

// Form event types
export interface FormEventHandlers {
  onSubmit: EventHandler<React.FormEvent>
  onChange: ChangeHandler<string>
  onBlur: EventHandler<React.FocusEvent>
  onFocus: EventHandler<React.FocusEvent>
}

// Common component prop types
export interface BaseComponentProps {
  children?: React.ReactNode
  className?: string
  id?: string
}

// Error boundary types
export interface ErrorInfo {
  componentStack: string
  errorBoundary?: string
  errorInfo?: string
}

export interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorId: string
}

// Performance monitoring types
export interface PerformanceMetrics {
  renderTime: number
  interactionTime: number
  memoryUsage?: number
  componentName: string
  timestamp: number
}

// Validation types
export interface ValidationRule<TValue = unknown> {
  validate: (value: TValue) => boolean | string
  message?: string
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

// Storage types
export interface StorageAdapter<TData = unknown> {
  get: (key: string) => TData | null
  set: (key: string, value: TData) => void
  remove: (key: string) => void
  clear: () => void
}

// Theme types
export interface ThemeColors {
  primary: string
  secondary: string
  background: string
  foreground: string
  muted: string
  accent: string
  destructive: string
  [key: string]: string
}

export interface ThemeConfig {
  colors: ThemeColors
  fonts: Record<string, string>
  spacing: Record<string, string>
  breakpoints: Record<string, string>
}