export interface ActionResult<T> {
  data: T | null
  error: string | null
}

export interface ActionCallbacks<T> {
  onSuccess?: (data: T) => void
  onFailure?: (error: string) => void
}

export async function actionHandlerWithValidation<T>(
  formData: FormData,
  fn: (data: Record<string, any>) => Promise<T>,
  callbacks?: ActionCallbacks<T>,
): Promise<ActionResult<T>> {
  const dataObject = Object.fromEntries(formData.entries())

  try {
    const fnResult = await fn(dataObject)
    const result: ActionResult<T> = { data: fnResult, error: null }
    if (result.data) {
      callbacks?.onSuccess?.(result.data)
    }
    return result
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    const result: ActionResult<T> = { data: null, error: errorMessage }

    if (result.error) {
      callbacks?.onFailure?.(result.error)
    }

    return result
  }
}
