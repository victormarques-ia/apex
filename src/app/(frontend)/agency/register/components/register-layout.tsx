import React from 'react'
import Link from 'next/link'
import { Plus, User, UserRound, Utensils } from 'lucide-react'
import { usePathname } from 'next/navigation'

type RegisterLayoutProps = {
  children: React.ReactNode
}

const RegisterLayout: React.FC<RegisterLayoutProps> = ({ children }) => {
  const pathname = usePathname()

  const userTypes = [
    {
      label: 'Atleta',
      href: '/agency/register/athlete',
      icon: <User className="text-blue-600" size={18} />,
    },
    {
      label: 'Nutricionista',
      href: '/agency/register/nutritionist',
      icon: <Utensils className="text-blue-600" size={18} />,
    },
    {
      label: 'Treinador',
      href: '/agency/register/trainer',
      icon: <UserRound className="text-blue-600" size={18} />,
    },
  ]

  // Determine the current user type from path
  const currentPath = pathname.split('/').pop() || ''
  const currentUserType =
    userTypes.find((type) => type.href.includes(currentPath))?.label || 'Atleta'

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header Section */}
      <div className="border-b border-zinc-300">
        <div className="px-6 py-6">
          <h1 className="text-4xl font-bold text-zinc-900 text-left">Cadastro de Usuários</h1>
          <p className="text-base text-zinc-500 mt-2">Adicione novos usuários à sua agência</p>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar with User Type Buttons */}
        <div className="w-64 p-6 border-r border-zinc-300">
          <div className="space-y-3 pt-1">
            {userTypes.map((type) => {
              const isActive = pathname.includes(type.href)
              return (
                <Link
                  key={type.label}
                  href={type.href}
                  className={`flex items-center justify-between w-full p-2 border ${
                    isActive ? 'bg-zinc-100 border-zinc-200' : 'border-zinc-200'
                  } rounded-md hover:bg-zinc-50 transition-colors`}
                >
                  <div className="flex items-center gap-2">
                    {type.icon}
                    <span className="text-base font-normal text-zinc-900">{type.label}</span>
                  </div>
                  <Plus className="text-blue-600" size={18} />
                </Link>
              )
            })}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-6">
          <div className="flex flex-col">
            <div>
              <h2 className="text-2xl font-semibold text-zinc-900">
                Cadastro de {currentUserType}
              </h2>
              <p className="text-base text-zinc-500 mt-1">
                {currentPath === 'athlete' && 'Gerencie os dados dos seus atletas.'}
                {currentPath === 'nutritionist' && 'Gerencie os dados dos seus nutricionistas.'}
                {currentPath === 'coach' && 'Gerencie os dados dos seus treinadores.'}
              </p>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterLayout
