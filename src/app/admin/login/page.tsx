import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth/rbac'
import { LoginForm } from './LoginForm'

export const metadata: Metadata = {
  title: 'Sign in',
}

export default async function LoginPage() {
  const user = await getCurrentUser()
  if (user) redirect('/admin')

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-6">
      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-xl font-bold tracking-tight">Hand Ball Press GH</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">Admin sign in</p>
      </div>
      <LoginForm />
    </main>
  )
}
