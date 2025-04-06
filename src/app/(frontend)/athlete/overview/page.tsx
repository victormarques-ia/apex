'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Header from '@/components/ui/header'
import AthleteDashboard from './components/AthleteDashboard'
import AthleteReportDashboard from './components/AthleteReportDashboard'
import { AthleteReadOnlyDietTab } from '@/components/ui/athlete-diet-tab'
import DailyConsumptionComponent from './components/daily-consumption'

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

// Define diet sub-tabs
const DIET_TABS = {
  CONSUMPTION: 'consumo',
  DIET_PLAN: 'plano',
}

export default function AthleteOverviewPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const activeTab = searchParams.get('tab') || TABS.OVERVIEW
  const activeOverviewTab = searchParams.get('overviewTab') || OVERVIEW_TABS.OVERVIEW
  const activeDietTab = searchParams.get('dietTab') || DIET_TABS.CONSUMPTION

  const [loading, setLoading] = useState<boolean>(true)
  const [athleteId, setAthleteId] = useState<string>('')
  const [userInfo, setUserInfo] = useState({ role: 'athlete', name: 'Atleta' })

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch('/api/users/me')
        if (response.ok) {
          const data = await response.json()
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
        if (!response.ok) throw new Error('Failed to fetch athlete profile')
        const data = await response.json()
        if (data.data && data.data.id) setAthleteId(data.data.id)
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
  const updateURLParams = (tab: string, subTab?: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', tab)
    if (tab === TABS.OVERVIEW && subTab) {
      params.set('overviewTab', subTab)
    } else if (tab === TABS.DIET && subTab) {
      params.set('dietTab', subTab)
    }
    router.push(`?${params.toString()}`)
  }

  const handleTabChange = (value: string) => updateURLParams(value)
  const handleOverviewTabChange = (value: string) => updateURLParams(TABS.OVERVIEW, value)

  const handleDietTabChange = (value: string) => {
    updateURLParams(TABS.DIET, value)
  }

  // Loading state
  if (loading) {
    return (
      <div>
        <Header userRole={userInfo.role} userName={userInfo.name} activeTab={activeTab} onTabChange={handleTabChange} hideAthleteSelector={true} />
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

  if (!athleteId) {
    return (
      <div>
        <Header userRole={userInfo.role} userName={userInfo.name} activeTab={activeTab} onTabChange={handleTabChange} hideAthleteSelector={true} />
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

  const renderContent = () => {
    if (activeTab === TABS.OVERVIEW) {
      return (
        <Card>
          <CardHeader className="pb-0">
            <div className="flex justify-between items-center">
              <div className="bg-gray-100 p-1 rounded-lg inline-flex">
                <button className={`px-6 py-2 text-sm font-medium rounded-md ${activeOverviewTab === OVERVIEW_TABS.OVERVIEW ? 'bg-white shadow-sm' : 'text-gray-500'}`} onClick={() => handleOverviewTabChange(OVERVIEW_TABS.OVERVIEW)}>Overview</button>
                <button className={`px-6 py-2 text-sm font-medium rounded-md ${activeOverviewTab === OVERVIEW_TABS.REPORTS ? 'bg-white shadow-sm' : 'text-gray-500'}`} onClick={() => handleOverviewTabChange(OVERVIEW_TABS.REPORTS)}>Avaliação</button>
                <button className={`px-6 py-2 text-sm font-medium rounded-md ${activeOverviewTab === OVERVIEW_TABS.REPORT ? 'bg-white shadow-sm' : 'text-gray-500'}`} onClick={() => handleOverviewTabChange(OVERVIEW_TABS.REPORT)}>Relatório</button>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {activeOverviewTab === OVERVIEW_TABS.OVERVIEW && <AthleteDashboard athleteId={athleteId} />}

            {activeOverviewTab === OVERVIEW_TABS.REPORTS && (
              <AthleteReportDashboard athleteId={athleteId} />
            )}
          </CardContent>
        </Card>
      )
    } else if (activeTab === TABS.DIET) {
      return (
        <Card>
          <CardHeader className="pb-0">
            <div className="flex justify-between items-center">
              {/* Diet sub-tabs */}
              <div className="bg-gray-100 p-1 rounded-lg inline-flex">
                <button
                  className={`px-6 py-2 text-sm font-medium rounded-md ${activeDietTab === DIET_TABS.CONSUMPTION ? 'bg-white shadow-sm' : 'text-gray-500'}`}
                  onClick={() => handleDietTabChange(DIET_TABS.CONSUMPTION)}
                >
                  Registro de Refeição
                </button>
                <button
                  className={`px-6 py-2 text-sm font-medium rounded-md ${activeDietTab === DIET_TABS.DIET_PLAN ? 'bg-white shadow-sm' : 'text-gray-500'}`}
                  onClick={() => handleDietTabChange(DIET_TABS.DIET_PLAN)}
                >
                  Dietas
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {activeDietTab === DIET_TABS.CONSUMPTION ? (
              <DailyConsumptionComponent athleteId={athleteId} />
            ) : (
              <AthleteReadOnlyDietTab athleteId={athleteId} />
            )}
          </CardContent>
        </Card>
      )
    } else if (activeTab === TABS.TRAINING) {
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
    }
  }

  return (
    <div>
      <Header userRole={userInfo.role} userName={userInfo.name} activeTab={activeTab} onTabChange={handleTabChange} hideAthleteSelector={true} />
      <div className="container mx-auto p-6 mt-20">{renderContent()}</div>
    </div>
  )
}
