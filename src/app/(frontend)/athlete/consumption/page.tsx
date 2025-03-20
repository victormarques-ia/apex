import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import DailyConsumptionPage from '../components/daily-consumption-page'
import payloadInstance from '@/payload.instance'

export const dynamic = 'force-dynamic'; // Garantir que a página não seja cacheada

export default async function AthleteConsumptionPage() {
  try {
    // Usar a mesma abordagem que a página home
    const headersList = headers()
    const { user } = await payloadInstance.auth({ headers: headersList })
    
    if (!user) {
      return redirect('/auth/sign-in')
    }
    
    // Buscar o perfil do atleta
    const athleteProfile = await payloadInstance.find({
      collection: 'athlete-profiles',
      where: {
        user: {
          equals: user.id,
        },
      },
      depth: 1,
    })
    
    if (!athleteProfile.docs || athleteProfile.docs.length === 0) {
      return (
        <div className="flex justify-center items-center h-screen">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            <p>Perfil de atleta não encontrado. Por favor, complete seu cadastro.</p>
          </div>
        </div>
      )
    }
    
    const athleteId = athleteProfile.docs[0].id
    
    return <DailyConsumptionPage athleteId={athleteId.toString()} />
  } catch (error) {
    console.error('Error fetching athlete profile', error)
    
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>Erro ao carregar o perfil de atleta</p>
          {process.env.NODE_ENV === 'development' && (
            <p className="text-sm mt-2">{String(error)}</p>
          )}
        </div>
      </div>
    )
  }
}
