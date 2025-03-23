import { cache } from 'react'
import { notFound } from 'next/navigation'
import { fetchFromApi } from '@/app/utils/fetch-from-api'
import { User } from '@/payload-types'
import { PayloadPaginatedResponse } from '@/app/types/payload-paginated-response'

export const dynamic = 'force-dynamic'

const getUsers = cache(async () => {
  const result = await fetchFromApi<PayloadPaginatedResponse<User>>('/api/users')

  if (!result.data) notFound()

  return result.data
})

export default async function Home() {
  const { docs } = await getUsers()

  if (!docs) return <div>Carregando...</div>
  return (
    <div>
      <h1>Seja bem vindo!</h1>
      <ul>
        {docs.map((user) => (
          <li key={user.id}>{user.email}</li>
        ))}
      </ul>
    </div>
  )
}
