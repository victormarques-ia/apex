import { headers as getHeaders } from 'next/headers.js'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export async function fetchFromApi<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<{
  error: {
    messages: string[]
    status: number
  } | null
  data: T | null
}> {
  const headersInstance = await getHeaders()
  const headersObject = Object.fromEntries(headersInstance.entries())

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    next: { revalidate: 0 },
    ...options,
    headers: {
      'Accept-Language': 'pt-BR',
      'Content-Type': 'application/json',
      Cookie: headersObject.cookie,
    },
  })

  if (!res.ok) {
    try {
      const response = await res.json()
      const errorMessages =
        response.errors?.map((error: { message: string }) => error.message) || []
      return {
        error: {
          messages: errorMessages,
          status: res.status,
        },
        data: null,
      }
    } catch (error) {
      return {
        error: {
          messages: [`Failed to parse error response: ${res.statusText || 'Unknown error'}`],
          status: res.status,
        },
        data: null,
      }
    }
  } else {
    try {
      return {
        error: null,
        data: await res.json(),
      }
    } catch (error) {
      return {
        error: {
          messages: ['Failed to parse success response as JSON'],
          status: res.status,
        },
        data: null,
      }
    }
  }
}
