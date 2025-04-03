// Client-side fetch utility that doesn't use server-side headers
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export async function clientFetch<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<{
  error: {
    messages: string[]
    status: number
  } | null
  data: T | null
}> {
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Accept-Language': 'pt-BR',
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
    })

    if (!res.ok) {
      let errorMessages = ['Erro na requisição'];
      try {
        const errorData = await res.json();
        if (errorData.errors) {
          errorMessages = errorData.errors.map(
            (error: { message: string }) => error.message
          );
        }
      } catch (e) {
        // If JSON parsing fails, use default error message
      }

      return {
        error: {
          messages: errorMessages,
          status: res.status,
        },
        data: null,
      };
    } else {
      return {
        error: null,
        data: await res.json(),
      };
    }
  } catch (error) {
    return {
      error: {
        messages: [(error as Error).message || 'Erro na conexão'],
        status: 500,
      },
      data: null,
    };
  }
}
