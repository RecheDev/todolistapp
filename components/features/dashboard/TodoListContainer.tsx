import { Suspense, lazy, useState, useCallback } from 'react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { TodoListSkeleton } from '@/components/features/todo/TodoSkeleton'
import { EmptyState } from './EmptyState'
import { VirtualList } from '@/components/ui/VirtualList'
import { TodoErrorBoundary, VirtualListErrorBoundary } from '@/components/ui/feature-error-boundaries'
import type { Todo } from '@/types/database'

const TodoItem = lazy(() => import('@/components/features/todo/TodoItem').then(module => ({ default: module.TodoItem })))

interface TodoListContainerProps {
  filteredTodos: Todo[]
  allTodos: Todo[]
  isReordering: boolean
  isUpdating: boolean
  isDeleting: boolean
  isToggling: boolean
  bulkSelectMode: boolean
  selectedTodos: Set<string>
  onDragEnd: (event: DragEndEvent) => void
  onToggleTodo: (id: string, completed: boolean) => void
  onUpdateTodo: (id: string, updates: { title: string; description?: string }) => void
  onDeleteTodo: (id: string) => void
  onToggleShoppingItem: (todoId: string, itemId: string, completed: boolean) => void
  onSelectTodo: (todoId: string, selected: boolean) => void
}

export function TodoListContainer({
  filteredTodos,
  allTodos,
  isReordering,
  isUpdating,
  isDeleting,
  isToggling,
  bulkSelectMode,
  selectedTodos,
  onDragEnd,
  onToggleTodo,
  onUpdateTodo,
  onDeleteTodo,
  onToggleShoppingItem,
  onSelectTodo,
}: TodoListContainerProps) {
  const [isDragging, setIsDragging] = useState(false)
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px of movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = useCallback(() => {
    setIsDragging(true)
  }, [])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setIsDragging(false)
    onDragEnd(event)
  }, [onDragEnd])

  // Use virtualization for large lists when not dragging
  const shouldUseVirtualization = filteredTodos.length > 50 && !isDragging && !bulkSelectMode

  const renderTodoItem = useCallback((todo: Todo, index: number) => (
    <div
      key={todo.id}
      className={shouldUseVirtualization ? "" : "animate-in fade-in slide-in-from-bottom-2 duration-300"}
      style={shouldUseVirtualization ? {} : { animationDelay: `${index * 50}ms` }}
    >
      <TodoErrorBoundary>
        <Suspense fallback={<TodoListSkeleton count={1} />}>
          <TodoItem
            todo={todo}
            onToggle={onToggleTodo}
            onUpdate={onUpdateTodo}
            onDelete={onDeleteTodo}
            onToggleShoppingItem={onToggleShoppingItem}
            isUpdating={isUpdating}
            isDeleting={isDeleting}
            isToggling={isToggling}
            isDragging={isReordering}
            bulkSelectMode={bulkSelectMode}
            isSelected={selectedTodos.has(todo.id)}
            onSelect={(selected) => onSelectTodo(todo.id, selected)}
          />
        </Suspense>
      </TodoErrorBoundary>
    </div>
  ), [
    shouldUseVirtualization,
    onToggleTodo,
    onUpdateTodo,
    onDeleteTodo,
    onToggleShoppingItem,
    isUpdating,
    isDeleting,
    isToggling,
    isReordering,
    bulkSelectMode,
    selectedTodos,
    onSelectTodo,
  ])

  return (
    <>
      {/* Live region for status updates */}
      <div className="sr-only" aria-live="polite" aria-atomic="true" id="status-updates">
        {/* Screen readers will announce todo status changes here */}
      </div>

      {filteredTodos.length === 0 ? (
        <EmptyState hasAnyTodos={allTodos.length > 0} />
      ) : shouldUseVirtualization ? (
        /* Virtual List for large datasets */
        <div role="list" aria-label="Todo list">
          <VirtualListErrorBoundary>
            <VirtualList
              items={filteredTodos}
              itemHeight={120} // Approximate height of a todo item
              height={600} // Container height - adjust based on viewport
              renderItem={renderTodoItem}
              className="space-y-4"
              overscan={10}
            />
          </VirtualListErrorBoundary>
        </div>
      ) : (
        /* Regular list with drag & drop for smaller datasets */
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="space-y-4" role="list" aria-label="Todo list">
            <SortableContext 
              items={filteredTodos.map(todo => todo.id)}
              strategy={verticalListSortingStrategy}
            >
              {filteredTodos.map((todo, index) => renderTodoItem(todo, index))}
            </SortableContext>
          </div>
        </DndContext>
      )}
    </>
  )
}