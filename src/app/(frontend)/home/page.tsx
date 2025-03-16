import { cache } from 'react'
import { notFound } from 'next/navigation'
import { di } from '@/app/di'

const getUsers = cache(async () => {
  const users = await di.userService.getUsers()

  if (!users) notFound()
  return users
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
