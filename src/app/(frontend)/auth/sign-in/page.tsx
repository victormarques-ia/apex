'use client'

import { useEffect } from 'react'

import { z } from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { signInAction } from '../actions/sign-in.action'
import { AuthLayout } from '../components/auth-layout'
import { useCustomForm } from '@/app/hooks/use-custom-form'

const schema = z.object({
  email: z.string().email({ message: 'Email inválido' }),
  password: z.string().min(6, { message: 'Senha deve ter no mínimo 6 caracteres' }),
})

export default function LoginPage() {
  const router = useRouter()

  const { pending, state, onSubmit, ...form } = useCustomForm({
    action: signInAction,
    schema,
    defaultValues: {
      email: '',
      password: '',
    },
  })

  useEffect(() => {
    if (state.error) {
      toast.error(state.error)
    } else if (state.data) {
      toast.success('Login efetuado com sucesso!')
      router.replace('/home')
    }
  }, [state])

  return (
    <AuthLayout title="Login">
      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="seu@email.com"
                      type="email"
                      autoComplete="email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      placeholder="******"
                      autoComplete="current-password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>
      </Form>

      <div className="mt-4 text-center text-sm">
        <Link href="/auth/recover-password" className="underline hover:text-primary">
          Recuperar senha
        </Link>
      </div>
    </AuthLayout>
  )
}
