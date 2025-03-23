import { notFound } from 'next/navigation'
import { fetchFromApi } from '@/app/utils/fetch-from-api'
import { User } from '@/payload-types'
import { PaginatedDocs } from 'payload'

export const dynamic = 'force-dynamic'

const getUsers = async () => {
  const result = await fetchFromApi<PaginatedDocs<User>>('/api/users')

  if (!result.data) notFound()

  return result.data
}

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
