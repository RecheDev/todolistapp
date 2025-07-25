'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  Calendar,
  Target,
  Zap,
  Activity
} from 'lucide-react'
import { Todo } from '@/types/database'
import { cn } from '@/lib/utils'

interface StatsBoardProps {
  todos: Todo[]
  onClose?: () => void
}

export function StatsBoard({ todos, onClose }: StatsBoardProps) {
  const stats = useMemo(() => {
    const total = todos.length
    const completed = todos.filter(t => t.completed).length
    const pending = total - completed
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

    // Priority statistics
    const priorities = {
      high: todos.filter(t => t.priority === 'high').length,
      medium: todos.filter(t => t.priority === 'medium').length,
      low: todos.filter(t => t.priority === 'low').length
    }

    const prioritiesPending = {
      high: todos.filter(t => t.priority === 'high' && !t.completed).length,
      medium: todos.filter(t => t.priority === 'medium' && !t.completed).length,
      low: todos.filter(t => t.priority === 'low' && !t.completed).length
    }

    // Date statistics
    const withDueDate = todos.filter(t => t.due_date).length
    const overdue = todos.filter(t => {
      if (!t.due_date || t.completed) return false
      return new Date(t.due_date) < new Date()
    }).length

    const dueSoon = todos.filter(t => {
      if (!t.due_date || t.completed) return false
      const dueDate = new Date(t.due_date)
      const today = new Date()
      const threeDaysFromNow = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000)
      return dueDate >= today && dueDate <= threeDaysFromNow
    }).length

    // Type statistics
    const regularTodos = todos.filter(t => t.type === 'todo').length
    const shoppingLists = todos.filter(t => t.type === 'shopping_list').length

    // Recent statistics (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    
    const recentlyCreated = todos.filter(t => 
      new Date(t.created_at) >= sevenDaysAgo
    ).length

    const recentlyCompleted = todos.filter(t => 
      t.completed && new Date(t.updated_at) >= sevenDaysAgo
    ).length

    return {
      total,
      completed,
      pending,
      completionRate,
      priorities,
      prioritiesPending,
      withDueDate,
      overdue,
      dueSoon,
      regularTodos,
      shoppingLists,
      recentlyCreated,
      recentlyCompleted
    }
  }, [todos])

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 dark:text-red-400'
      case 'medium': return 'text-yellow-600 dark:text-yellow-400'
      case 'low': return 'text-green-600 dark:text-green-400'
      default: return 'text-muted-foreground'
    }
  }

  const getPriorityBg = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 dark:bg-red-900/30'
      case 'medium': return 'bg-yellow-100 dark:bg-yellow-900/30'
      case 'low': return 'bg-green-100 dark:bg-green-900/30'
      default: return 'bg-muted'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Statistics Dashboard</h1>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-xl font-semibold"
          >
            ✕
          </button>
        )}
      </div>

      {/* Main statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.regularTodos} tasks, {stats.shoppingLists} lists
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">
              {stats.completionRate}% progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">
              To complete
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progreso general */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Overall Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Completed Tasks</span>
              <span>{stats.completed} de {stats.total}</span>
            </div>
            <Progress value={stats.completionRate} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {stats.completionRate}% completed
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Priority statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Tasks by Priority
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(['high', 'medium', 'low'] as const).map((priority) => (
              <div key={priority} className={cn(
                "p-4 rounded-lg border",
                getPriorityBg(priority)
              )}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium capitalize">
                    {priority === 'high' ? 'High' : priority === 'medium' ? 'Medium' : 'Low'}
                  </span>
                  <Badge variant="secondary" className={getPriorityColor(priority)}>
                    {stats.priorities[priority]}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  {stats.prioritiesPending[priority]} pending
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Date statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Date Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border bg-blue-50 dark:bg-blue-900/20">
              <div className="text-2xl font-bold text-blue-600">{stats.withDueDate}</div>
              <div className="text-sm text-blue-800 dark:text-blue-200">With due date</div>
            </div>
            <div className="p-4 rounded-lg border bg-orange-50 dark:bg-orange-900/20">
              <div className="text-2xl font-bold text-orange-600">{stats.dueSoon}</div>
              <div className="text-sm text-orange-800 dark:text-orange-200">Due soon</div>
            </div>
            <div className="p-4 rounded-lg border bg-red-50 dark:bg-red-900/20">
              <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
              <div className="text-sm text-red-800 dark:text-red-200">Overdue</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity (7 days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border bg-green-50 dark:bg-green-900/20">
              <div className="text-2xl font-bold text-green-600">{stats.recentlyCreated}</div>
              <div className="text-sm text-green-800 dark:text-green-200">Tasks created</div>
            </div>
            <div className="p-4 rounded-lg border bg-blue-50 dark:bg-blue-900/20">
              <div className="text-2xl font-bold text-blue-600">{stats.recentlyCompleted}</div>
              <div className="text-sm text-blue-800 dark:text-blue-200">Tasks completed</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}