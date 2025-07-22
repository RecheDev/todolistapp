import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface AuthSkeletonProps {
  type: 'login' | 'register'
  delay?: number
}

export function AuthSkeleton({ type, delay = 0 }: AuthSkeletonProps) {
  const isRegister = type === 'register'
  
  return (
    <div 
      className="w-full max-w-md animate-in fade-in duration-300"
      style={{ animationDelay: `${delay}ms` }}
    >
      <Card className="bg-background border-border shadow-offset">
        <CardHeader className="space-y-3">
          <div className="text-center space-y-2">
            <Skeleton className="h-8 w-32 mx-auto rounded-md" />
            <Skeleton className="h-4 w-48 mx-auto rounded-md" />
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Email field */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-12 rounded-md" />
            <Skeleton className="h-11 w-full rounded-md" />
          </div>
          
          {/* Password field */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-20 rounded-md" />
            <Skeleton className="h-11 w-full rounded-md" />
          </div>
          
          {/* Confirm password for register */}
          {isRegister && (
            <div className="space-y-2">
              <Skeleton className="h-4 w-32 rounded-md" />
              <Skeleton className="h-11 w-full rounded-md" />
            </div>
          )}
          
          {/* Submit button */}
          <Skeleton className="h-11 w-full rounded-md" />
          
          {/* Link to other form */}
          <div className="text-center">
            <Skeleton className="h-4 w-40 mx-auto rounded-md" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function AuthLayoutSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background animate-in fade-in duration-300">
      <AuthSkeleton type="login" />
    </div>
  )
}