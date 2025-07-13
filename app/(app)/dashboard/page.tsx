'use client'

import { useState } from 'react'
import { useTodos } from '@/hooks/useTodos'
import { useAuth } from '@/hooks/useAuth'
import { useNetworkStatus } from '@/hooks/useNetworkStatus'
import { AddTodo } from '@/components/features/todo/AddTodo'
import { TodoItem } from '@/components/features/todo/TodoItem'
import { TodoListSkeleton } from '@/components/features/todo/TodoSkeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LogOut, Search, Filter } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ThemeToggle } from '@/components/ui/theme-toggle'

type FilterType = 'all' | 'pending' | 'completed'

export default function DashboardPage() {
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
    isCreating,
    isUpdating,
    isDeleting,
    isToggling,
  } = useTodos()

  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<FilterType>('all')

  // Filter and search todos
  const filteredTodos = todos
    .filter((todo) => {
      if (filter === 'completed') return todo.completed
      if (filter === 'pending') return !todo.completed
      return true
    })
    .filter((todo) =>
      todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (todo.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
    )

  const stats = {
    total: todos.length,
    completed: todos.filter((t) => t.completed).length,
    pending: todos.filter((t) => !t.completed).length,
  }

  const handleLogout = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

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
        <main className="container py-6 space-y-6">
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
          <div className="container flex h-16 items-center justify-between">
            <h1 className="text-xl font-semibold">My Todos</h1>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {user?.email}
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </Button>
            </div>
          </div>
        </header>

        {/* Error Content */}
        <main className="container py-6">
          <Card className="w-full max-w-md mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-destructive flex items-center justify-center gap-2">
                <span className="text-2xl">⚠️</span>
                Something went wrong
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                {error instanceof Error ? error.message : 'Failed to load your todos'}
              </p>
              <Button onClick={() => window.location.reload()} className="w-full">
                Try again
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold">My Todos</h1>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{stats.total} total</Badge>
              <Badge variant="default">{stats.pending} pending</Badge>
              <Badge variant="secondary">{stats.completed} completed</Badge>
              {!isOnline && (
                <Badge variant="destructive" className="animate-pulse">
                  Offline
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {user?.email}
            </span>
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-6 space-y-6">
        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search todos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <Filter className="h-4 w-4 mr-2" />
                {filter === 'all' ? 'All Todos' : filter === 'pending' ? 'Pending' : 'Completed'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setFilter('all')}>
                All Todos ({stats.total})
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('pending')}>
                Pending ({stats.pending})
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter('completed')}>
                Completed ({stats.completed})
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Add Todo */}
        <AddTodo 
          onAdd={(title, description) => createTodo({ title, description })} 
          isCreating={isCreating} 
        />

        {/* Todo List */}
        <div className="space-y-4">
          {filteredTodos.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="text-muted-foreground text-center">
                  {todos.length === 0 ? (
                    <>
                      <h3 className="text-lg font-medium mb-2">No todos yet</h3>
                      <p className="text-sm">Create your first todo to get started!</p>
                    </>
                  ) : (
                    <>
                      <h3 className="text-lg font-medium mb-2">No todos found</h3>
                      <p className="text-sm">Try adjusting your search or filter.</p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={(id, completed) => toggleTodo({ id, completed })}
                onUpdate={(id, updates) => updateTodo({ id, updates })}
                onDelete={(id) => deleteTodo(id)}
                isUpdating={isUpdating}
                isDeleting={isDeleting}
                isToggling={isToggling}
              />
            ))
          )}
        </div>
      </main>
    </div>
  )
}