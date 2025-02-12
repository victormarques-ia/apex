'use client'

import { useActionState } from 'react'
import { signInAction } from '../actions/sign-in.action'

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(signInAction, {
    data: null,
    error: null,
  })

  return (
    <form action={formAction}>
      <input type="email" name="email" placeholder="Email" required />
      <input type="password" name="password" placeholder="Senha" required />

      {state.error && (
        <p aria-live="polite" style={{ color: 'red' }}>
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending}>
        {pending ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  )
}
