'use client'

import { useForm as useRhfForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { startTransition, useActionState, useCallback } from 'react'
import { type ActionResult } from '@/app/utils/action-handle-with-validation'
import { type z, type ZodSchema } from 'zod'

export function useCustomForm<TSchema extends ZodSchema>({
  schema,
  defaultValues,
  action,
}: {
  action: (_state: unknown, formData: FormData) => Promise<ActionResult<any>>
  schema: TSchema
  defaultValues?: z.infer<TSchema>
}) {
  const form = useRhfForm<z.infer<TSchema>>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  const [state, formAction, pending] = useActionState(action, {
    data: null,
    error: null,
  })

  const onSubmit = useCallback(
    (data: z.infer<TSchema>) => {
      const formData = new FormData()
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, String(value))
      })

      startTransition(() => {
        formAction(formData)
      })
    },
    [formAction],
  )

  return {
    ...form,
    state,
    pending,
    onSubmit: form.handleSubmit(onSubmit),
  }
}
