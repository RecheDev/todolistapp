import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Todo } from '@/types/database'

// Base mutation context type
export interface BaseMutationContext {
  previousTodos?: Todo[]
  [key: string]: unknown
}

// Mutation configuration
interface MutationConfig<TData, TVariables, TContext extends BaseMutationContext = BaseMutationContext> {
  mutationFn: (variables: TVariables) => Promise<TData>
  queryKey: readonly unknown[]
  
  // Optimistic update functions
  onMutate?: (variables: TVariables, previousTodos: Todo[] | undefined) => {
    updatedTodos?: Todo[]
    context?: TContext
  }
  
  // Success handling
  onSuccess?: (data: TData, variables: TVariables, context: TContext | undefined) => void
  showSuccessToast?: boolean | ((data: TData, variables: TVariables, context: TContext | undefined) => string)
  
  // Error handling  
  onError?: (error: Error, variables: TVariables, context: TContext | undefined) => void
  showErrorToast?: boolean | string
  rollbackOnError?: boolean
  
  // Additional options
  additionalOptions?: Partial<UseMutationOptions<TData, Error, TVariables, TContext>>
}

export function useMutationFactory<TData, TVariables, TContext extends BaseMutationContext = BaseMutationContext>(
  config: MutationConfig<TData, TVariables, TContext>
) {
  const queryClient = useQueryClient()

  return useMutation<TData, Error, TVariables, TContext>({
    mutationFn: config.mutationFn,
    
    onMutate: async (variables) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: config.queryKey })
      
      // Snapshot the previous value
      const previousTodos = queryClient.getQueryData<Todo[]>(config.queryKey)
      
      let context: TContext = { previousTodos } as TContext
      let updatedTodos: Todo[] | undefined
      
      // Apply optimistic update if provided
      if (config.onMutate) {
        const result = config.onMutate(variables, previousTodos)
        updatedTodos = result.updatedTodos
        context = { ...context, ...result.context }
      }
      
      // Update the cache with optimistic data
      if (updatedTodos) {
        queryClient.setQueryData<Todo[]>(config.queryKey, updatedTodos)
      }
      
      return context
    },
    
    onSuccess: (data, variables, context) => {
      // Handle success toast
      if (config.showSuccessToast) {
        const message = typeof config.showSuccessToast === 'function' 
          ? config.showSuccessToast(data, variables, context)
          : 'Operation completed successfully'
        toast.success(message)
      }
      
      // Call custom success handler
      config.onSuccess?.(data, variables, context)
      
      // Invalidate queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: config.queryKey })
    },
    
    onError: (error, variables, context) => {
      // Rollback optimistic update if enabled
      if (config.rollbackOnError && context?.previousTodos) {
        queryClient.setQueryData(config.queryKey, context.previousTodos)
      }
      
      // Handle error toast
      if (config.showErrorToast) {
        const message = typeof config.showErrorToast === 'string' 
          ? config.showErrorToast
          : `Operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        toast.error(message)
      }
      
      // Call custom error handler
      config.onError?.(error, variables, context)
    },
    
    ...config.additionalOptions,
  })
}

// Specialized mutation factories for common patterns

// Simple mutation without optimistic updates
export function useSimpleMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  queryKey: readonly unknown[],
  options?: {
    successMessage?: string
    errorMessage?: string
    onSuccess?: (data: TData, variables: TVariables) => void
    onError?: (error: Error, variables: TVariables) => void
  }
) {
  return useMutationFactory({
    mutationFn,
    queryKey,
    showSuccessToast: options?.successMessage ? () => options.successMessage! : false,
    showErrorToast: options?.errorMessage ? options.errorMessage : true,
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  })
}

// Optimistic mutation for immediate UI updates
export function useOptimisticMutation<TData, TVariables, TContext extends BaseMutationContext = BaseMutationContext>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  queryKey: readonly unknown[],
  optimisticUpdate: (variables: TVariables, previousTodos: Todo[] | undefined) => Todo[],
  options?: {
    successToast?: boolean | ((data: TData, variables: TVariables, context: TContext | undefined) => string)
    errorMessage?: string
    onSuccess?: (data: TData, variables: TVariables, context: TContext | undefined) => void
    onError?: (error: Error, variables: TVariables, context: TContext | undefined) => void
    additionalContext?: (variables: TVariables, previousTodos: Todo[] | undefined) => TContext
  }
) {
  return useMutationFactory<TData, TVariables, TContext>({
    mutationFn,
    queryKey,
    rollbackOnError: true,
    showSuccessToast: options?.successToast || false,
    showErrorToast: options?.errorMessage || true,
    onMutate: (variables, previousTodos) => ({
      updatedTodos: optimisticUpdate(variables, previousTodos),
      context: options?.additionalContext?.(variables, previousTodos),
    }),
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  })
}

// Mutation with undo functionality
export function useUndoableMutation<TData, TVariables, TContext extends BaseMutationContext = BaseMutationContext>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  queryKey: readonly unknown[],
  optimisticUpdate: (variables: TVariables, previousTodos: Todo[] | undefined) => Todo[],
  undoAction: () => void,
  options?: {
    successMessage: (data: TData, variables: TVariables, context: TContext | undefined) => string
    undoLabel?: string
    undoDuration?: number
    errorMessage?: string
    onSuccess?: (data: TData, variables: TVariables, context: TContext | undefined) => void
    onError?: (error: Error, variables: TVariables, context: TContext | undefined) => void
    additionalContext?: (variables: TVariables, previousTodos: Todo[] | undefined) => TContext
  }
) {
  return useMutationFactory<TData, TVariables, TContext>({
    mutationFn,
    queryKey,
    rollbackOnError: true,
    showErrorToast: options?.errorMessage || true,
    onMutate: (variables, previousTodos) => ({
      updatedTodos: optimisticUpdate(variables, previousTodos),
      context: options?.additionalContext?.(variables, previousTodos),
    }),
    onSuccess: (data, variables, context) => {
      const message = options?.successMessage(data, variables, context) || 'Action completed'
      toast.success(message, {
        action: {
          label: options?.undoLabel || 'Undo',
          onClick: undoAction,
        },
        duration: options?.undoDuration || 5000,
      })
      options?.onSuccess?.(data, variables, context)
    },
    onError: options?.onError,
  })
}

// Bulk operation mutation
export function useBulkMutation<TData, TVariables extends { ids: string[] }, TContext extends BaseMutationContext = BaseMutationContext>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  queryKey: readonly unknown[],
  optimisticUpdate: (variables: TVariables, previousTodos: Todo[] | undefined) => Todo[],
  options?: {
    successMessage: (variables: TVariables) => string
    errorMessage?: string
    onSuccess?: (data: TData, variables: TVariables, context: TContext | undefined) => void
    onError?: (error: Error, variables: TVariables, context: TContext | undefined) => void
    additionalContext?: (variables: TVariables, previousTodos: Todo[] | undefined) => TContext
  }
) {
  return useMutationFactory<TData, TVariables, TContext>({
    mutationFn,
    queryKey,
    rollbackOnError: true,
    showErrorToast: options?.errorMessage || 'Bulk operation failed',
    onMutate: (variables, previousTodos) => ({
      updatedTodos: optimisticUpdate(variables, previousTodos),
      context: options?.additionalContext?.(variables, previousTodos),
    }),
    onSuccess: (data, variables, context) => {
      const message = options?.successMessage(variables) || `${variables.ids.length} items updated`
      toast.success(message)
      options?.onSuccess?.(data, variables, context)
    },
    onError: options?.onError,
  })
}