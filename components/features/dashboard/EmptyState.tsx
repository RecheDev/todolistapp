import { Card, CardContent } from '@/components/ui/card'

interface EmptyStateProps {
  hasAnyTodos: boolean
}

export function EmptyState({ hasAnyTodos }: EmptyStateProps) {
  return (
    <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="text-muted-foreground text-center">
          {!hasAnyTodos ? (
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
  )
}