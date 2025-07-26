'use client'

import { useRef, Suspense, lazy } from 'react'
import { useTodos } from '@/hooks/useTodos'
import { useAuth } from '@/hooks/useAuth'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'
import { useSearchAndFilter } from '@/hooks/useSearchAndFilter'
import { useTodoStats } from '@/hooks/useTodoStats'
import { useTodoSelection } from '@/hooks/useTodoSelection'
import { useDashboardKeyboard } from '@/hooks/useDashboardKeyboard'
import { useTodoHandlers } from '@/hooks/useTodoHandlers'
import { TodoListSkeleton } from '@/components/features/todo/TodoSkeleton'
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
import { DashboardErrorBoundary } from '@/components/ui/feature-error-boundaries'

// Lazy load heavy components
const AddTodo = lazy(() => import('@/components/features/todo/AddTodo').then(module => ({ default: module.AddTodo })))

function DashboardPageInternal() {
  const { user, signOut } = useAuth()
  const { isOnline } = useNetworkStatus()
  const {
    todos,
    loading,
    error,
    createTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    reorderTodos,
    bulkAction,
    deleteCompleted,
    isCreating,
    isUpdating,
    isDeleting,
    isToggling,
    isBulkAction,
  } = useTodos()

  const searchInputRef = useRef<HTMLInputElement>(null)
  
  // Custom hooks for focused responsibilities
  const { searchQuery, setSearchQuery, filter, setFilter, filteredTodos } = useSearchAndFilter(todos)
  const stats = useTodoStats(todos)
  const { selectedTodos, bulkSelectMode, setBulkSelectMode, handleSelectTodo, handleSelectAll, clearSelection } = useTodoSelection()
  
  const {
    handleLogout,
    handleCreateTodo,
    handleToggleTodo,
    handleUpdateTodo,
    handleDeleteTodo,
    handleBulkComplete,
    handleBulkIncomplete,
    handleBulkDelete,
    handleDeleteCompleted
  } = useTodoHandlers({
    createTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    reorderTodos,
    bulkAction,
    deleteCompleted,
    signOut,
    filteredTodos,
    allTodos: todos
  })

  // Initialize keyboard shortcuts
  useDashboardKeyboard({ searchInputRef, setFilter })

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
        <main className="px-4 py-6 md:px-6 md:py-8 space-y-6 md:space-y-8 max-w-4xl mx-auto">
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
        <main className="px-4 py-6 md:px-6 md:py-8 max-w-md mx-auto">
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

      <main className="container mx-auto px-4 py-6 md:px-6 md:py-8 space-y-6 md:space-y-8">
        <MobileStats stats={stats} isOnline={isOnline} />

        {(bulkSelectMode || selectedTodos.size > 0) && (
          <BulkActionsBar
            selectedCount={selectedTodos.size}
            totalCount={filteredTodos.length}
            allSelected={selectedTodos.size === filteredTodos.length}
            isBulkAction={isBulkAction}
            onSelectAll={() => handleSelectAll(filteredTodos)}
            onBulkComplete={() => handleBulkComplete(selectedTodos, clearSelection)}
            onBulkIncomplete={() => handleBulkIncomplete(selectedTodos, clearSelection)}
            onBulkDelete={() => handleBulkDelete(selectedTodos, clearSelection)}
            onCancel={clearSelection}
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
            isCreating={isCreating} 
          />
        </Suspense>

        <TodoListContainer
          filteredTodos={filteredTodos}
          allTodos={todos}
          isUpdating={isUpdating}
          isDeleting={isDeleting}
          isToggling={isToggling}
          bulkSelectMode={bulkSelectMode}
          selectedTodos={selectedTodos}
          onToggleTodo={handleToggleTodo}
          onUpdateTodo={handleUpdateTodo}
          onDeleteTodo={handleDeleteTodo}
          onSelectTodo={handleSelectTodo}
        />
      </main>
      {(process.env.NODE_ENV === 'development' ||
        process.env.NEXT_PUBLIC_THEME_DEBUG === 'true') && <ThemeDebug />}
    </div>
  )
}

export default function DashboardPage() {
  return (
    <DashboardErrorBoundary>
      <DashboardPageInternal />
    </DashboardErrorBoundary>
  )
}