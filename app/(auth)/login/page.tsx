import { Suspense, lazy } from 'react'
import { AuthSkeleton } from '@/components/features/auth/AuthSkeleton'

const LoginForm = lazy(() => import('@/components/features/auth/LoginForm').then(module => ({
  default: module.LoginForm
})))

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col px-4 py-4 bg-background">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-sm font-medium text-muted-foreground">
          ToDoAPP by RecheDev
        </h1>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-sm mx-auto">
          <Suspense fallback={<AuthSkeleton type="login" />}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}