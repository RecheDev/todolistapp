import { Suspense, lazy } from 'react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { TodoListSkeleton } from '@/components/features/todo/TodoSkeleton'
import { EmptyState } from './EmptyState'
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
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  return (
    <>
      {/* Live region for status updates */}
      <div className="sr-only" aria-live="polite" aria-atomic="true" id="status-updates">
        {/* Screen readers will announce todo status changes here */}
      </div>

      {/* Todo List with Drag & Drop */}
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <div className="space-y-4" role="list" aria-label="Todo list">
          {filteredTodos.length === 0 ? (
            <EmptyState hasAnyTodos={allTodos.length > 0} />
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
                </div>
              ))}
            </SortableContext>
          )}
        </div>
      </DndContext>
    </>
  )
}