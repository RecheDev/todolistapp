'use client'

import { useState, useMemo, useCallback, useEffect, useRef, Suspense, lazy } from 'react'
import { useTodos } from '@/hooks/useTodos'
import { useAuth } from '@/hooks/useAuth'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'
import { useDebounce } from '@/hooks/useDebounce'
import { TodoListSkeleton } from '@/components/features/todo/TodoSkeleton'
import { DragEndEvent } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { 
  DashboardHeader,
  MobileStats,
  BulkActionsBar,
  SearchAndFilterBar,
  TodoListContainer
} from '@/components/features/dashboard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LogOut } from 'lucide-react'
import { ThemeDebug } from '@/components/ui/theme-debug'

// Lazy load heavy components
const AddTodo = lazy(() => import('@/components/features/todo/AddTodo').then(module => ({ default: module.AddTodo })))
// Dark mode only - no theme toggle needed

type FilterType = 'all' | 'pending' | 'completed'

export default function DashboardPage() {
  const { user, signOut } = useAuth()
  const { isOnline } = useNetworkStatus()
  const {
    todos,
    loading,
    error,
    createTodo,
    createShoppingList,
    updateTodo,
    deleteTodo,
    toggleTodo,
    toggleShoppingItem,
    reorderTodos,
    bulkAction,
    deleteCompleted,
    isCreating,
    isUpdating,
    isDeleting,
    isToggling,
    isReordering,
    isBulkAction,
  } = useTodos()

  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<FilterType>('all')
  const [selectedTodos, setSelectedTodos] = useState<Set<string>>(new Set())
  const [bulkSelectMode, setBulkSelectMode] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  
  
  // Debounce search query to avoid excessive filtering
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  // Memoized filter and search todos
  const filteredTodos = useMemo(() => {
    return todos
      .filter((todo) => {
        if (filter === 'completed') return todo.completed
        if (filter === 'pending') return !todo.completed
        return true
      })
      .filter((todo) => {
        const query = debouncedSearchQuery.toLowerCase()
        if (!query) return true
        return todo.title.toLowerCase().includes(query) ||
               (todo.description?.toLowerCase().includes(query) ?? false)
      })
  }, [todos, filter, debouncedSearchQuery])

  // Memoized stats calculation
  const stats = useMemo(() => {
    const completed = todos.filter((t) => t.completed).length
    return {
      total: todos.length,
      completed,
      pending: todos.length - completed,
    }
  }, [todos])

  const handleLogout = useCallback(async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }, [signOut])

  const handleCreateTodo = useCallback((title: string, description?: string, priority?: 'low' | 'medium' | 'high', due_date?: string) => {
    createTodo({ title, description, priority, due_date })
  }, [createTodo])

  const handleToggleTodo = useCallback((id: string, completed: boolean) => {
    toggleTodo({ id, completed })
  }, [toggleTodo])

  const handleUpdateTodo = useCallback((id: string, updates: { title: string; description?: string }) => {
    updateTodo({ id, updates })
  }, [updateTodo])

  const handleDeleteTodo = useCallback((id: string) => {
    deleteTodo(id)
  }, [deleteTodo])
  
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    
    if (!over || active.id === over.id) {
      return
    }
    
    const oldIndex = filteredTodos.findIndex(todo => todo.id === active.id)
    const newIndex = filteredTodos.findIndex(todo => todo.id === over.id)
    
    if (oldIndex !== -1 && newIndex !== -1) {
      const reorderedTodos = arrayMove(filteredTodos, oldIndex, newIndex)
      const todoIds = reorderedTodos.map(todo => todo.id)
      reorderTodos(todoIds)
    }
  }, [filteredTodos, reorderTodos])
  
  const handleSelectTodo = useCallback((todoId: string, selected: boolean) => {
    setSelectedTodos(prev => {
      const newSelection = new Set(prev)
      if (selected) {
        newSelection.add(todoId)
      } else {
        newSelection.delete(todoId)
      }
      return newSelection
    })
  }, [])
  
  const handleSelectAll = useCallback(() => {
    if (selectedTodos.size === filteredTodos.length) {
      setSelectedTodos(new Set())
    } else {
      setSelectedTodos(new Set(filteredTodos.map(todo => todo.id)))
    }
  }, [selectedTodos.size, filteredTodos])
  
  const handleBulkComplete = useCallback(() => {
    if (selectedTodos.size > 0) {
      bulkAction({ todoIds: Array.from(selectedTodos), action: 'complete' })
      setSelectedTodos(new Set())
    }
  }, [selectedTodos, bulkAction])
  
  const handleBulkIncomplete = useCallback(() => {
    if (selectedTodos.size > 0) {
      bulkAction({ todoIds: Array.from(selectedTodos), action: 'incomplete' })
      setSelectedTodos(new Set())
    }
  }, [selectedTodos, bulkAction])
  
  const handleBulkDelete = useCallback(() => {
    if (selectedTodos.size > 0 && window.confirm(`Delete ${selectedTodos.size} selected todos?`)) {
      bulkAction({ todoIds: Array.from(selectedTodos), action: 'delete' })
      setSelectedTodos(new Set())
    }
  }, [selectedTodos, bulkAction])
  
  const handleDeleteCompleted = useCallback(() => {
    const completedCount = todos.filter(t => t.completed).length
    if (completedCount > 0 && window.confirm(`Delete all ${completedCount} completed todos?`)) {
      deleteCompleted()
    }
  }, [todos, deleteCompleted])

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Focus search with Cmd/Ctrl + K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
      
      // Filter shortcuts
      if ((e.metaKey || e.ctrlKey) && e.shiftKey) {
        switch (e.key) {
          case 'A':
            e.preventDefault()
            setFilter('all')
            break
          case 'P':
            e.preventDefault()
            setFilter('pending')
            break
          case 'C':
            e.preventDefault()
            setFilter('completed')
            break
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header Skeleton */}
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-6 w-20 bg-muted rounded animate-pulse"></div>
              <div className="flex items-center gap-2">
                <div className="h-5 w-16 bg-muted rounded animate-pulse"></div>
                <div className="h-5 w-16 bg-muted rounded animate-pulse"></div>
                <div className="h-5 w-16 bg-muted rounded animate-pulse"></div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-32 bg-muted rounded animate-pulse"></div>
              <div className="h-8 w-8 bg-muted rounded animate-pulse"></div>
              <div className="h-8 w-20 bg-muted rounded animate-pulse"></div>
            </div>
          </div>
        </header>

        {/* Main Content Skeleton */}
        <main className="px-4 py-4 md:px-6 md:py-6 space-y-4 md:space-y-6 max-w-4xl mx-auto">
          {/* Search and Filter Skeleton */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 h-10 bg-muted rounded animate-pulse"></div>
            <div className="w-full sm:w-auto h-10 bg-muted rounded animate-pulse"></div>
          </div>

          {/* Add Todo Skeleton */}
          <Card>
            <CardContent className="p-4">
              <div className="h-10 bg-muted rounded animate-pulse"></div>
            </CardContent>
          </Card>

          {/* Todo List Skeleton */}
          <TodoListSkeleton count={5} />
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="px-4 flex h-14 md:h-16 items-center justify-between">
            <h1 className="text-sm md:text-lg font-medium text-muted-foreground">ToDoAPP by RecheDev</h1>
            <div className="flex items-center gap-1 md:gap-2">
              <span className="text-xs text-muted-foreground hidden lg:inline">
                {user?.email}
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="h-8 px-2 md:px-3 text-muted-foreground hover:text-foreground hover:bg-accent">
                <LogOut className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline ml-1 md:ml-2">Sign out</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Error Content */}
        <main className="px-4 py-4 md:px-6 md:py-6 max-w-md mx-auto">
          <Card className="w-full max-w-md mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-destructive flex items-center justify-center gap-3 text-2xl">
                <span className="text-4xl">⚠️</span>
                Algo salió mal
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-xl text-muted-foreground leading-relaxed">
                {error instanceof Error ? error.message : 'No se pudieron cargar tus tareas'}
              </p>
              <Button 
                onClick={() => window.location.reload()} 
                className="w-full h-16 text-xl font-bold bg-primary hover:bg-primary/80 active:bg-primary/70 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                🔄 Intentar de nuevo
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        stats={stats}
        isOnline={isOnline}
        userEmail={user?.email}
        onLogout={handleLogout}
      />

      <main className="container mx-auto px-6 py-6 space-y-6">
        <MobileStats stats={stats} isOnline={isOnline} />

        {(bulkSelectMode || selectedTodos.size > 0) && (
          <BulkActionsBar
            selectedCount={selectedTodos.size}
            totalCount={filteredTodos.length}
            allSelected={selectedTodos.size === filteredTodos.length}
            isBulkAction={isBulkAction}
            onSelectAll={handleSelectAll}
            onBulkComplete={handleBulkComplete}
            onBulkIncomplete={handleBulkIncomplete}
            onBulkDelete={handleBulkDelete}
            onCancel={() => {
              setBulkSelectMode(false)
              setSelectedTodos(new Set())
            }}
          />
        )}

        <SearchAndFilterBar
          ref={searchInputRef}
          searchQuery={searchQuery}
          filter={filter}
          stats={stats}
          completedCount={todos.filter(t => t.completed).length}
          bulkSelectMode={bulkSelectMode}
          isBulkAction={isBulkAction}
          onSearchChange={setSearchQuery}
          onFilterChange={setFilter}
          onToggleBulkMode={() => setBulkSelectMode(!bulkSelectMode)}
          onDeleteCompleted={handleDeleteCompleted}
        />

        <Suspense fallback={<TodoListSkeleton count={1} />}>
          <AddTodo 
            onAdd={handleCreateTodo}
            onAddShoppingList={(title, description, items) => 
              createShoppingList({ title, description, items })
            }
            isCreating={isCreating} 
          />
        </Suspense>

        <TodoListContainer
          filteredTodos={filteredTodos}
          allTodos={todos}
          isReordering={isReordering}
          isUpdating={isUpdating}
          isDeleting={isDeleting}
          isToggling={isToggling}
          bulkSelectMode={bulkSelectMode}
          selectedTodos={selectedTodos}
          onDragEnd={handleDragEnd}
          onToggleTodo={handleToggleTodo}
          onUpdateTodo={handleUpdateTodo}
          onDeleteTodo={handleDeleteTodo}
          onToggleShoppingItem={(todoId, itemId, completed) =>
            toggleShoppingItem({ todoId, itemId, completed })
          }
          onSelectTodo={handleSelectTodo}
        />
      </main>
      {(process.env.NODE_ENV === 'development' ||
        process.env.NEXT_PUBLIC_THEME_DEBUG === 'true') && <ThemeDebug />}
    </div>
  )
}