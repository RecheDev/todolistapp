'use client'

import { useState, useMemo, useCallback, useEffect, useRef, Suspense, lazy } from 'react'
import { useTodos } from '@/hooks/useTodos'
import { useAuth } from '@/hooks/useAuth'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'
import { useDebounce } from '@/hooks/useDebounce'
import { TodoListSkeleton } from '@/components/features/todo/TodoSkeleton'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'

// Lazy load heavy components
const AddTodo = lazy(() => import('@/components/features/todo/AddTodo').then(module => ({ default: module.AddTodo })))
const TodoItem = lazy(() => import('@/components/features/todo/TodoItem').then(module => ({ default: module.TodoItem })))
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { LogOut, Search, Filter } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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
  
  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )
  
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
      {/* Header with accent border */}
      <header className="sticky top-0 z-50 w-full border-b-2 border-border bg-background/80 backdrop-blur-lg accent-border-top">
        <div className="px-6 flex h-20 items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-primary">
              📋 My Tasks
            </h1>
            <div className="hidden sm:flex items-center gap-3">
              <Badge variant="outline" className="text-sm font-semibold px-3 py-1">{stats.total} total</Badge>
              <Badge variant="default" className="text-sm font-semibold px-3 py-1">{stats.pending} pending</Badge>
              <Badge variant="secondary" className="text-sm font-semibold px-3 py-1">{stats.completed} completed</Badge>
              {!isOnline && (
                <Badge variant="destructive" className="animate-pulse text-sm font-semibold px-3 py-1">
                  Sin conexión
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm hidden md:inline font-medium bg-muted/30 px-3 py-1 rounded text-secondary">
              {user?.email}
            </span>
            <ThemeToggle />
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="h-10 px-4 text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200"
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span className="text-sm">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-6 space-y-6">
        {/* Stats badges for mobile */}
        <div className="flex sm:hidden items-center gap-2 overflow-x-auto">
          <Badge variant="outline" className="text-xs whitespace-nowrap">{stats.total} total</Badge>
          <Badge variant="default" className="text-xs whitespace-nowrap">{stats.pending} pending</Badge>
          <Badge variant="secondary" className="text-xs whitespace-nowrap">{stats.completed} completed</Badge>
          {!isOnline && (
            <Badge variant="destructive" className="animate-pulse text-xs whitespace-nowrap">
              Offline
            </Badge>
          )}
        </div>

        {/* Bulk Actions Bar */}
        {(bulkSelectMode || selectedTodos.size > 0) && (
          <Card className="p-4 bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={selectedTodos.size === filteredTodos.length && filteredTodos.length > 0}
                  onCheckedChange={handleSelectAll}
                  className="h-5 w-5"
                  aria-label="Select all todos"
                />
                <span className="text-sm font-medium">
                  {selectedTodos.size} of {filteredTodos.length} selected
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkComplete}
                  disabled={selectedTodos.size === 0 || isBulkAction}
                  className="h-8 text-xs"
                >
                  ✅ Complete
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleBulkIncomplete}
                  disabled={selectedTodos.size === 0 || isBulkAction}
                  className="h-8 text-xs"
                >
                  ⏳ Incomplete
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                  disabled={selectedTodos.size === 0 || isBulkAction}
                  className="h-8 text-xs"
                >
                  🗑️ Delete
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setBulkSelectMode(false)
                    setSelectedTodos(new Set())
                  }}
                  className="h-8 text-xs"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Search and Filter Bar */}
        <div className="flex flex-col gap-3 md:flex-row md:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              placeholder="🔍 Search tasks... (Cmd+K)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base border-2 focus:border-primary transition-all duration-200 rounded-lg shadow-input"
              aria-label="Search todos by title or description"
              aria-describedby="search-help"
            />
            <div id="search-help" className="sr-only">
              Type to search through your todos by title or description. Press Cmd+K to focus search. Use Cmd+Shift+A for all, Cmd+Shift+P for pending, Cmd+Shift+C for completed.
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full md:w-auto h-12 font-medium border-2 hover:bg-accent transition-all duration-200 rounded-lg shadow-input"
                aria-label={`Filter todos. Currently showing: ${filter === 'all' ? 'all todos' : filter === 'pending' ? 'pending todos' : 'completed todos'}`}
                aria-haspopup="menu"
                aria-expanded="false"
              >
                <Filter className="h-6 w-6 mr-3" />
                {filter === 'all' ? '📋 All Tasks' : filter === 'pending' ? '⏳ Pending' : '✅ Completed'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56" role="menu" aria-label="Filter options">
              <DropdownMenuItem 
                onClick={() => setFilter('all')} 
                className="cursor-pointer hover:bg-accent p-4 text-lg font-medium"
                role="menuitem"
              >
                📋 All Tasks ({stats.total})
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setFilter('pending')} 
                className="cursor-pointer hover:bg-accent p-4 text-lg font-medium"
                role="menuitem"
              >
                ⏳ Pending ({stats.pending})
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setFilter('completed')} 
                className="cursor-pointer hover:bg-accent p-4 text-lg font-medium"
                role="menuitem"
              >
                ✅ Completed ({stats.completed})
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Bulk Actions Toggle */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setBulkSelectMode(!bulkSelectMode)}
              className="w-full md:w-auto h-12 font-medium border-2 hover:bg-accent transition-all duration-200 rounded-lg"
            >
              {bulkSelectMode ? '🔲 Exit Select' : '☑️ Select Multiple'}
            </Button>
            {todos.filter(t => t.completed).length > 0 && (
              <Button
                variant="outline"
                onClick={handleDeleteCompleted}
                disabled={isBulkAction}
                className="w-full md:w-auto h-12 font-medium border-2 hover:bg-red-50 hover:border-red-200 transition-all duration-200 rounded-lg text-red-600"
              >
                🗑️ Clear Completed
              </Button>
            )}
          </div>
        </div>

        {/* Add Todo */}
        <Suspense fallback={<TodoListSkeleton count={1} />}>
          <AddTodo 
            onAdd={handleCreateTodo}
            onAddShoppingList={(title, description, items) => 
              createShoppingList({ title, description, items })
            }
            isCreating={isCreating} 
          />
        </Suspense>

        {/* Live region for status updates */}
        <div className="sr-only" aria-live="polite" aria-atomic="true" id="status-updates">
          {/* Screen readers will announce todo status changes here */}
        </div>

        {/* Todo List with Drag & Drop */}
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="space-y-4" role="list" aria-label="Todo list">
            {filteredTodos.length === 0 ? (
              <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="text-muted-foreground text-center">
                    {todos.length === 0 ? (
                      <>
                        <div className="text-4xl mb-4">📝</div>
                        <h3 className="text-lg font-medium mb-2">No todos yet</h3>
                        <p className="text-sm">Create your first todo to get started!</p>
                      </>
                    ) : (
                      <>
                        <div className="text-4xl mb-4">🔍</div>
                        <h3 className="text-lg font-medium mb-2">No tasks found</h3>
                        <p className="text-sm">Try adjusting your search or filter.</p>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <SortableContext 
                items={filteredTodos.map(todo => todo.id)}
                strategy={verticalListSortingStrategy}
              >
                {filteredTodos.map((todo, index) => (
                  <div
                    key={todo.id}
                    className="animate-in fade-in slide-in-from-bottom-2 duration-300"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <Suspense fallback={<TodoListSkeleton count={1} />}>
                      <TodoItem
                        todo={todo}
                        onToggle={handleToggleTodo}
                        onUpdate={handleUpdateTodo}
                        onDelete={handleDeleteTodo}
                        onToggleShoppingItem={(todoId, itemId, completed) =>
                          toggleShoppingItem({ todoId, itemId, completed })
                        }
                        isUpdating={isUpdating}
                        isDeleting={isDeleting}
                        isToggling={isToggling}
                        isDragging={isReordering}
                        bulkSelectMode={bulkSelectMode}
                        isSelected={selectedTodos.has(todo.id)}
                        onSelect={(selected) => handleSelectTodo(todo.id, selected)}
                      />
                    </Suspense>
                  </div>
                ))}
              </SortableContext>
            )}
          </div>
        </DndContext>
      </main>
    </div>
  )
}