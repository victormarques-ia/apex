'use client'

import { useCustomForm } from '@/app/hooks/use-custom-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { newsletterAction } from '../actions/newsletter.action'
import { z } from 'zod'
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form'

const schema = z.object({
  email: z.string().email({ message: 'Email inválido' }),
})

export function NewsletterForm() {
  const { pending, state, onSubmit, ...form } = useCustomForm({
    action: newsletterAction,
    schema,
    defaultValues: {
      email: '',
    },
  })

  useEffect(() => {
    if (state.error) {
      toast.error(state.error)
    } else if (state.data) {
      form.reset()
      toast.success('Email cadastrado com sucesso!')
    }
  }, [state])

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="flex gap-8 flex-row items-center justify-between w-full">
        <div className="w-full">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="seu@email.com"
                    type="email"
                    required
                    autoComplete="email"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" disabled={pending}>
          {pending ? 'Assinando...' : 'Assinar'}
        </Button>
      </form>
    </Form>
  )
}
