'use client'

import { useEffect } from 'react'
import { AuthLayout } from '../components/auth-layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { z } from 'zod'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useCustomForm } from '@/app/hooks/use-custom-form'
import { redefinePasswordAction } from '../actions/redefine-password.action'

const schema = z
  .object({
    password: z.string().min(6, { message: 'Senha deve ter no mínimo 6 caracteres' }),
    confirmPassword: z.string().min(6, { message: 'Senha deve ter no mínimo 6 caracteres' }),
    token: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Senhas não conferem',
        path: ['confirmPassword'],
      })
    }
  })
export default function RedefinePasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''

  const { pending, state, onSubmit, ...form } = useCustomForm({
    action: redefinePasswordAction,
    schema,
    defaultValues: {
      password: '',
      confirmPassword: '',
      token: token,
    },
  })
  useEffect(() => {
    if (state.error) {
      toast.error(state.error)
    } else if (state.data) {
      toast.success('Senha redefinida com sucesso!')
      router.replace('/auth/sign-in')
    }
  }, [state, router])

  return (
    <AuthLayout title="Redefinir senha">
      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nova senha</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="******"
                      {...field}
                      type="password"
                      autoComplete="new-password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirme senha</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="******"
                      {...field}
                      type="password"
                      autoComplete="new-password"
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
    </AuthLayout>
  )
}
