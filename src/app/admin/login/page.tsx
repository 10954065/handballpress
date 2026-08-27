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
    <main className="bg-paper flex min-h-screen flex-col items-center justify-center gap-8 px-6">
      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-ink font-serif text-2xl font-semibold">Handball Press GH</h1>
        <p className="text-muted text-sm">Admin sign in</p>
      </div>
      <LoginForm />
    </main>
  )
}
