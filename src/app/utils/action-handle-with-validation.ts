import { z } from 'zod'

export interface ActionResult<T> {
  data: T | null
  error: string | null
}

export interface ActionCallbacks<T> {
  onSuccess?: (data: T) => void
  onFailure?: (error: string) => void
}

export async function actionHandlerWithValidation<T, S extends z.ZodTypeAny>(
  formData: FormData,
  schema: S,
  fn: (data: z.infer<S>) => Promise<T>,
  callbacks?: ActionCallbacks<T>,
): Promise<ActionResult<T>> {
  const dataObject = Object.fromEntries(formData.entries())
  const parsed = schema.safeParse(dataObject)
  let result: ActionResult<T>

  if (!parsed.success) {
    result = {
      data: null,
      error: Object.values(parsed.error.flatten().fieldErrors).flat().join(', '),
    }
  } else {
    try {
      const fnResult = await fn(parsed.data)
      result = { data: fnResult, error: null }
    } catch (error) {
      console.warn(`[actionHandlerWithValidation]: `, error)
      result = {
        data: null,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      }
    }
  }

  if (result.error) {
    callbacks?.onFailure?.(result.error)
  } else if (result.data !== null) {
    callbacks?.onSuccess?.(result.data)
  }

  return result
}
