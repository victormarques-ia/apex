// src/app/login/page.tsx
'use client'

import { useActionState } from 'react'
import { loginAction } from '../actions/sign-in.action'

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, {
    message: '',
  })

  return (
    <form action={formAction}>
      <input type="email" name="email" placeholder="Email" required />
      <input type="password" name="password" placeholder="Senha" required />

      {state.message && (
        <p aria-live="polite">
          {typeof state.message === 'string'
            ? state.message
            : Object.values(state.message).flat().join(', ')}
        </p>
      )}

      <button type="submit" disabled={pending}>
        {pending ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  )
}
