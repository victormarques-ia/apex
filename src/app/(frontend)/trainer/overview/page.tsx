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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import TrainerDashboard from './components/trainerDashboard'
import { DietTabContent } from '@/app/(frontend)/nutritionist/components/diet-tab'
import { WorkoutTabContent } from '@/app/(frontend)/trainer/components/workout-tab'
import Header from '@/components/ui/header'

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

export default function TrainerOverviewPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Get active tab and athlete from URL params
  const activeTab = searchParams.get('tab') || TABS.OVERVIEW
  const athleteId = searchParams.get('athleteId') || ''

  // State variables
  const [athletes, setAthletes] = useState<Athlete[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>(athleteId)

  const [userInfo, setUserInfo] = useState({ role: 'trainer', name: 'Treinador' }) // Default values

  // Fetch the list of athletes assigned to the trainer
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch('/api/users/me')
        if (response.ok) {
          const data = await response.json()
          console.log('User info:', data)
          setUserInfo({
            role: data.user.role || 'trainer',
            name: data.user.name || 'Treinador',
          })
        }
      } catch (error) {
        console.error('Error fetching user info:', error)
      }
    }

    const fetchAthletes = async () => {
      try {
        const response = await fetch('/api/trainers/athletes')

        if (!response.ok) {
          throw new Error('Failed to fetch athletes')
        }

        console.log(response)

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
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-64">
              <p>Carregando...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // No athletes state
  if (athletes.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-64">
              <p>Nenhum atleta encontrado. Adicione atletas para visualizar seus dados.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <Header
        userRole={userInfo.role}
        userName={userInfo.name}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        athleteId={selectedAthleteId}
        athletes={athletes}
        onAthleteChange={handleAthleteChange}
      />
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Painel de Treinador</h1>
      </div>

      {/* Main content with tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        {/* Tab contents - will be filled with actual components later */}
        <Card>
          <CardContent className="p-6">
            <TabsContent value={TABS.OVERVIEW} className="mt-0">
              <div className="min-h-[600px]">
                {selectedAthleteId && <TrainerDashboard athleteId={selectedAthleteId} />}
              </div>
            </TabsContent>

            <TabsContent value={TABS.DIET} className="mt-0">
              {selectedAthleteId ? (
                <DietTabContent
                  athleteId={selectedAthleteId}
                  nutritionistId={'-1'}
                  onlyView={true}
                />
              ) : (
                <div className="min-h-[600px] flex items-center justify-center">
                  <p>Selecione um atleta para visualizar o plano alimentar</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value={TABS.TRAINING} className="mt-0">
              {selectedAthleteId ? (
                <WorkoutTabContent
                  athleteId={selectedAthleteId}
                  trainerId={'-1'}
                  onlyView={false}
                />
              ) : (
                <div className="min-h-[600px] flex items-center justify-center">
                  <p>Selecione um atleta para visualizar o plano de treinos</p>
                </div>
              )}
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  )
}
