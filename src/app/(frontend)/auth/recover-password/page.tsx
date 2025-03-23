'use client'

import { useEffect } from 'react'
import { recoverPasswordAction } from '../actions/recover-password.action'
import { AuthLayout } from '../components/auth-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import Link from 'next/link'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useCustomForm } from '@/app/hooks/use-custom-form'

const schema = z.object({
  email: z.string().email({ message: 'Email inválido' }),
})

export default function RecoverPasswordPage() {
  const router = useRouter()

  const { pending, state, onSubmit, ...form } = useCustomForm({
    action: recoverPasswordAction,
    schema,
    defaultValues: {
      email: '',
    },
  })
  useEffect(() => {
    if (state.error) {
      toast.error(state.error)
    } else if (state.data) {
      toast.success('Email enviado com sucesso!')
    }
  }, [state])

  return (
    <AuthLayout title="Recuperar senha">
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
                      placeholder="seu@email.com"
                      {...field}
                      type="email"
                      autoComplete="email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Enviando...' : 'Enviar'}
          </Button>
        </form>
      </Form>

      <div className="mt-4 text-center text-sm">
        <Link className="underline hover:text-primary" href="/auth/sign-in">
          Já tem uma conta? Faça login
        </Link>
      </div>
    </AuthLayout>
  )
}
