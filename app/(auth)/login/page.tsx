import { LoginForm } from '@/components/features/auth/LoginForm'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <LoginForm />
    </div>
  )
}