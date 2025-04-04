/*
 * ATENÇÃO FRONTENDERS: Modifique o arquivo abaixo para atender às suas necessidades
 * ATENÇÃO FRONTENDERS: Modifique o arquivo abaixo para atender às suas necessidades
 * ATENÇÃO FRONTENDERS: Modifique o arquivo abaixo para atender às suas necessidades
 * ATENÇÃO FRONTENDERS: Modifique o arquivo abaixo para atender às suas necessidades
 * ATENÇÃO FRONTENDERS: Modifique o arquivo abaixo para atender às suas necessidades
 * ATENÇÃO FRONTENDERS: Modifique o arquivo abaixo para atender às suas necessidades
 * ATENÇÃO FRONTENDERS: Modifique o arquivo abaixo para atender às suas necessidades
 * ATENÇÃO FRONTENDERS: Modifique o arquivo abaixo para atender às suas necessidades
 * ATENÇÃO FRONTENDERS: Modifique o arquivo abaixo para atender às suas necessidades
 * ATENÇÃO FRONTENDERS: Modifique o arquivo abaixo para atender às suas necessidades
 * ATENÇÃO FRONTENDERS: Modifique o arquivo abaixo para atender às suas necessidades
 * ATENÇÃO FRONTENDERS: Modifique o arquivo abaixo para atender às suas necessidades
 * ATENÇÃO FRONTENDERS: Modifique o arquivo abaixo para atender às suas necessidades
 * ATENÇÃO FRONTENDERS: Modifique o arquivo abaixo para atender às suas necessidades
 */
'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import Header from '@/components/ui/header'
import NutritionDashboard from './components/NutritionDashboard'
import { DietTabContent } from '@/components/ui/diet-tab'

// Define the main tabs
const TABS = {
  OVERVIEW: 'overview',
  DIET: 'dieta',
  TRAINING: 'treinos',
  SETTINGS: 'configuracoes',
}

// Types for athlete data
type Athlete = {
  id: string
  user: {
    id: string
    name: string
  }
}

export default function NutritionistOverviewPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get active tab and athlete from URL params
  const activeTab = searchParams.get('tab') || TABS.OVERVIEW
  const athleteId = searchParams.get('athleteId') || ''

  // State variables
  const [athletes, setAthletes] = useState<Athlete[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>(athleteId)
  const [userInfo, setUserInfo] = useState({ role: 'nutritionist', name: 'Nutricionista' }) // Default values

  // Fetch user info and athletes
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch('/api/users/me')
        if (response.ok) {
          const data = await response.json()
          console.log('User info:', data)
          setUserInfo({
            role: data.user.role || 'nutritionist',
            name: data.user.name || 'Nutricionista',
          })
        }
      } catch (error) {
        console.error('Error fetching user info:', error)
      }
    }

    const fetchAthletes = async () => {
      try {
        const response = await fetch('/api/nutritionists/my-athletes')

        if (!response.ok) {
          throw new Error('Failed to fetch athletes')
        }

        const data = await response.json()
        setAthletes(data.data.athletes || [])

        // If no athlete is selected but we have athletes, auto-select the first one
        if (!selectedAthleteId && data.data.athletes?.length > 0) {
          setSelectedAthleteId(data.data.athletes[0].id)
          updateURLParams(activeTab, data.data.athletes[0].id)
        }
      } catch (error) {
        console.error('Error fetching athletes:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserInfo()
    fetchAthletes()
  }, [])

  // Update URL params when tab or athlete changes
  const updateURLParams = (tab: string, athleteId: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', tab)
    params.set('athleteId', athleteId)
    router.push(`?${params.toString()}`)
  }

  // Handle tab change
  const handleTabChange = (value: string) => {
    updateURLParams(value, selectedAthleteId)
  }

  // Handle athlete selection change
  const handleAthleteChange = (value: string) => {
    setSelectedAthleteId(value)
    updateURLParams(activeTab, value)
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
          athleteId={selectedAthleteId}
          athletes={athletes}
          onAthleteChange={handleAthleteChange}
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

  // No athletes state
  if (athletes.length === 0) {
    return (
      <div>
        <Header
          userRole={userInfo.role}
          userName={userInfo.name}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          athleteId={selectedAthleteId}
          athletes={athletes}
          onAthleteChange={handleAthleteChange}
        />
        <div className="container mx-auto p-6 mt-20">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center h-64">
                <p>Nenhum atleta encontrado. Adicione atletas para visualizar seus dados.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Header
        userRole={userInfo.role}
        userName={userInfo.name}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        athleteId={selectedAthleteId}
        athletes={athletes}
        onAthleteChange={handleAthleteChange}
      />

      <div className="container mx-auto p-6 mt-20">
        {/* Main content based on selected tab */}
        <Card>
          <CardContent className="p-6">
            {activeTab === TABS.OVERVIEW && (
              <div className="min-h-[600px]">
                {selectedAthleteId && <NutritionDashboard athleteId={selectedAthleteId} />}
              </div>
            )}

            {activeTab === TABS.DIET && (
              <div>
                {selectedAthleteId ? (
                  <DietTabContent athleteId={selectedAthleteId} />
                ) : (
                  <div className="min-h-[600px] flex items-center justify-center">
                    <p>Selecione um atleta para visualizar o plano alimentar</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === TABS.TRAINING && (
              <div className="min-h-[600px]">
                <h2 className="text-xl font-semibold mb-4">Treinos</h2>
                <p>Conteúdo dos treinos para o atleta selecionado. ID: {selectedAthleteId}</p>
              </div>
            )}

            {activeTab === TABS.SETTINGS && (
              <div className="min-h-[600px]">
                <h2 className="text-xl font-semibold mb-4">Configurações</h2>
                <p>Configurações para o atleta selecionado. ID: {selectedAthleteId}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
