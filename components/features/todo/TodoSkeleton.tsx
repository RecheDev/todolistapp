import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export function TodoSkeleton({ delay = 0 }: { delay?: number }) {
  return (
    <Card 
      className="w-full animate-in fade-in duration-300 bg-background border-border"
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Skeleton className="h-5 w-5 mt-1 rounded-md" />
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4 rounded-md" />
                <Skeleton className="h-4 w-1/2 rounded-md" />
              </div>
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
            <div className="flex items-center gap-2 mt-3">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-4 w-20 rounded-md" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function TodoListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4" role="status" aria-label="Loading todos">
      {Array.from({ length: count }).map((_, i) => (
        <TodoSkeleton key={i} delay={i * 100} />
      ))}
    </div>
  )
}