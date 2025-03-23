'use client'

import { useActionState, useEffect } from 'react'
import { signInAction } from '../actions/sign-in.action'
import { AuthLayout } from '../components/auth-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { toast } from 'sonner'

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(signInAction, {
    data: null,
    error: null,
  })

  useEffect(() => {
    if (state.error) {
      toast.error(state.error)
    }
  }, [state.error])

  return (
    <AuthLayout title="Login">
      <form
        action={formAction}
        className="space-y-2 flex flex-col justify-between items-center"
        method="POST"
      >
        <Input type="email" name="email" placeholder="Email" required />
        <Input type="password" name="password" placeholder="Senha" required />

        {state.error && (
          <p aria-live="polite" className="text-red-600 text-xs">
            {state.error}
          </p>
        )}

        <Button className="bg-blue-700 hover:bg-blue-800 text-white w-full" disabled={pending}>
          {pending ? 'Entrando...' : 'Entrar'}
        </Button>
        <div className="pt-4">
          <Link
            className="text-gray-500 underline hover:text-blue-700 "
            href="/auth/recover-password"
          >
            Recuperar senha
          </Link>
        </div>
      </form>
    </AuthLayout>
  )
}
