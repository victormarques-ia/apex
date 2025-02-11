// src/actions/sign-in.action.ts
'use server'

import { authService } from '@/app/(payload)/services/auth.service'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const schema = z.object({
  email: z.string({
    invalid_type_error: 'Email inválido',
  }),
  password: z.string({
    invalid_type_error: 'Senha inválida',
  }),
})

export async function loginAction(
  state: { message: string | { email?: string[]; password?: string[] } },
  formData: FormData,
) {
  try {
    const validatedFields = schema.safeParse({
      email: formData.get('email'),
      password: formData.get('password'),
    })

    if (!validatedFields.success) {
      return {
        message: validatedFields.error.flatten().fieldErrors,
      }
    }

    const { user, token } = await authService.login(
      validatedFields.data.email,
      validatedFields.data.password,
    )

    if (!user || !token) {
      return {
        message: 'Usuário ou senha inválidos',
      }
    }

    const co = await cookies()
    co.set('payload-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    })
  } catch (error) {
    return {
      message: 'Erro ao fazer login',
    }
  }

  redirect('/home')
}
