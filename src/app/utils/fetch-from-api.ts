import { headers as getHeaders } from 'next/headers.js'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export async function fetchFromApi<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<{
  error: {
    message: string
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
      'Content-Type': 'application/json',
      ...headersObject,
    },
  })

  if (!res.ok) {
    return {
      error: {
        message: res.statusText,
        status: res.status,
      },
      data: null,
    }
  } else {
    return {
      error: null,
      data: await res.json(),
    }
  }
}
