'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Header from '@/components/ui/header'
import AthleteDashboard from './components/AthleteDashboard'
import { AthleteReadOnlyDietTab } from '@/components/ui/athlete-diet-tab'

// Define the main tabs
const TABS = {
  OVERVIEW: 'overview',
  DIET: 'dieta',
  TRAINING: 'treinos',
  SETTINGS: 'configuracoes',
}

// Define overview sub-tabs
const OVERVIEW_TABS = {
  OVERVIEW: 'overview',
  REPORTS: 'avaliacao',
  REPORT: 'relatorio',
}

export default function AthleteOverviewPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get active tab and athlete from URL params
  const activeTab = searchParams.get('tab') || TABS.OVERVIEW
  const activeOverviewTab = searchParams.get('overviewTab') || OVERVIEW_TABS.OVERVIEW

  // State variables
  const [loading, setLoading] = useState<boolean>(true)
  const [athleteId, setAthleteId] = useState<string>('')
  const [userInfo, setUserInfo] = useState({ role: 'athlete', name: 'Atleta' }) // Default values

  // Fetch user info and athlete profile
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch('/api/users/me')
        if (response.ok) {
          const data = await response.json()
          console.log('User info:', data)
          setUserInfo({
            role: data.user.role || 'athlete',
            name: data.user.name || 'Atleta',
          })
        }
      } catch (error) {
        console.error('Error fetching user info:', error)
      }
    }

    const fetchAthleteProfile = async () => {
      try {
        const response = await fetch('/api/athlete-profiles/me')

        if (!response.ok) {
          throw new Error('Failed to fetch athlete profile')
        }

        const data = await response.json()
        console.log('Athlete profile:', data)
        if (data.data && data.data.id) {
          setAthleteId(data.data.id)
        }
      } catch (error) {
        console.error('Error fetching athlete profile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserInfo()
    fetchAthleteProfile()
  }, [])

  // Update URL params when tab changes
  const updateURLParams = (tab: string, overviewTab?: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', tab)
    if (tab === TABS.OVERVIEW && overviewTab) {
      params.set('overviewTab', overviewTab)
    }
    router.push(`?${params.toString()}`)
  }

  // Handle main tab change
  const handleTabChange = (value: string) => {
    updateURLParams(value)
  }

  // Handle overview sub-tab change
  const handleOverviewTabChange = (value: string) => {
    updateURLParams(TABS.OVERVIEW, value)
  }

  // Loading state
  if (loading) {
    return (
      <div>
        <Header
          userRole={userInfo.role}
          userName={userInfo.name}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          hideAthleteSelector={true}
        />
        <div className="container mx-auto p-6 mt-20">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center h-64">
                <p>Carregando...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // No athlete profile found
  if (!athleteId) {
    return (
      <div>
        <Header
          userRole={userInfo.role}
          userName={userInfo.name}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          hideAthleteSelector={true}
        />
        <div className="container mx-auto p-6 mt-20">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center h-64">
                <p>Perfil de atleta não encontrado.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Render appropriate content based on active tab
  const renderContent = () => {
    if (activeTab === TABS.OVERVIEW) {
      // Render overview content with sub-tabs
      return (
        <Card>
          <CardHeader className="pb-0">
            <div className="flex justify-between items-center">
              {/* Overview sub-tabs side by side with the date */}
              <div className="bg-gray-100 p-1 rounded-lg inline-flex">
                <button
                  className={`px-6 py-2 text-sm font-medium rounded-md ${activeOverviewTab === OVERVIEW_TABS.OVERVIEW ? 'bg-white shadow-sm' : 'text-gray-500'}`}
                  onClick={() => handleOverviewTabChange(OVERVIEW_TABS.OVERVIEW)}
                >
                  Overview
                </button>
                <button
                  className={`px-6 py-2 text-sm font-medium rounded-md ${activeOverviewTab === OVERVIEW_TABS.REPORTS ? 'bg-white shadow-sm' : 'text-gray-500'}`}
                  onClick={() => handleOverviewTabChange(OVERVIEW_TABS.REPORTS)}
                >
                  Avaliação
                </button>
                <button
                  className={`px-6 py-2 text-sm font-medium rounded-md ${activeOverviewTab === OVERVIEW_TABS.REPORT ? 'bg-white shadow-sm' : 'text-gray-500'}`}
                  onClick={() => handleOverviewTabChange(OVERVIEW_TABS.REPORT)}
                >
                  Relatório
                </button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {/* Content based on selected overview tab */}
            {activeOverviewTab === OVERVIEW_TABS.OVERVIEW && (
              <AthleteDashboard athleteId={athleteId} />
            )}

            {activeOverviewTab === OVERVIEW_TABS.REPORTS && (
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-4">Avaliação</h2>
                <p>Conteúdo da avaliação será exibido aqui.</p>
              </div>
            )}

            {activeOverviewTab === OVERVIEW_TABS.REPORT && (
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-4">Relatório</h2>
                <p>Conteúdo do relatório será exibido aqui.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )
    } else if (activeTab === TABS.DIET) {
      // Render diet tab
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Plano Alimentar</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <AthleteReadOnlyDietTab athleteId={athleteId} />
          </CardContent>
        </Card>
      )
    } else if (activeTab === TABS.TRAINING) {
      // Render training tab
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Treinos</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="min-h-[600px]">
              <p>Visualização dos seus treinos programados.</p>
            </div>
          </CardContent>
        </Card>
      )
    } else if (activeTab === TABS.SETTINGS) {
      // Render settings tab
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Configurações</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="min-h-[600px]">
              <p>Configurações da sua conta.</p>
            </div>
          </CardContent>
        </Card>
      )
    }
  }

  return (
    <div>
      <Header
        userRole={userInfo.role}
        userName={userInfo.name}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        hideAthleteSelector={true}
      />

      <div className="container mx-auto p-6 mt-20">{renderContent()}</div>
    </div>
  )
}
