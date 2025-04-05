import { redirect } from 'next/navigation'
import { fetchFromApi } from '@/app/utils/fetch-from-api'
import { User } from '@/payload-types'

export const dynamic = 'force-dynamic'

// Function to get the current authenticated user
const getCurrentUser = async () => {
  try {
    const result = await fetchFromApi<{ user: User }>('/api/users/me')
    if (!result.data) return null
    return result.data.user
  } catch (error) {
    console.error('Error fetching current user:', error)
    return null
  }
}

export default async function Home() {
  // Get the current authenticated user
  const user = await getCurrentUser()

  // If no user is found, show loading (we should never reach this point due to middleware)
  if (!user) {
    return <div>Carregando...</div>
  }

  // Redirect based on the user's role
  const roleRoutes = {
    athlete: '/athlete/overview',
    nutritionist: '/nutritionist/overview',
    trainer: '/trainer/overview',
    agency: '/agency/overview',
    // Default to /dashboard if role doesn't match
    default: '/dashboard',
  }

  // Get the appropriate redirect path based on user role
  const redirectPath = roleRoutes[user.role as keyof typeof roleRoutes] || roleRoutes.default

  // Redirect to the appropriate overview page
  redirect(redirectPath)

  // This return is just for type checking - the redirect will happen before this renders
  return null
}
