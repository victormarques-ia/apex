'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  getAthleteWorkoutPlansAction,
  deleteWorkoutPlanAction,
} from '@/app/(frontend)/trainer/actions/workoutPlan.action'
import { format } from 'date-fns'
import { PencilIcon, TrashIcon, PlusIcon } from 'lucide-react'

interface WorkoutPlansListProps {
  athleteId: string
  onSelectPlan: (plan: any) => void
  onEditPlan: (plan: any) => void
  onAddNewPlan: () => void
  onPlanDeleted: () => void
  selectedPlanId: string | null
  onlyView?: boolean
}

export function WorkoutPlansList({
  athleteId,
  onSelectPlan,
  onEditPlan,
  onAddNewPlan,
  onPlanDeleted,
  selectedPlanId,
  onlyView = false,
}: WorkoutPlansListProps) {
  const [workoutPlans, setWorkoutPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Track component mount status to avoid state updates after unmount
  const isMounted = React.useRef(true)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false
    }
  }, [])

  // Fetch all workout plans for this athlete
  useEffect(() => {
    const fetchWorkoutPlans = async () => {
      try {
        setLoading(true)

        // Request all workout plans for this athlete using the dedicated endpoint
        const formData = new FormData()
        formData.append('athleteId', athleteId)

        const response = await getAthleteWorkoutPlansAction(null, formData)
        console.log('Response getAthleteWorkoutPlansAction in WorkoutPlansList:', response)
        console.log('Response structure:', {
          hasData: !!response?.data,
          hasDataData: !!response?.data?.data,
          hasDataDocs: !!response?.data?.docs,
          hasDataDataDocs: !!response?.data?.data?.docs,
        })

        // For direct response from workout-plans endpoint
        if (response?.data?.data) {
          // Handle the response structure from our new endpoint
          setWorkoutPlans(response.data.data.docs || [])
        } else if (response?.data?.docs) {
          // Handle older response structure
          setWorkoutPlans(response.data.docs)
        } else {
          console.log('No workout plans found in response:', response)
          setWorkoutPlans([])
        }
      } catch (err) {
        console.error('Error fetching workout plans:', err)
        setError(
          `Erro ao buscar planos de treino: ${err instanceof Error ? err.message : 'Unknown error'}`,
        )
      } finally {
        setLoading(false)
      }
    }

    if (athleteId) {
      fetchWorkoutPlans()
    }
  }, [athleteId])

  // Handle plan deletion
  const handleDeletePlan = async (planId: string) => {
    if (
      !confirm(
        'Tem certeza que deseja excluir este plano de treino? Todos os exercícios associados também serão excluídos.',
      )
    ) {
      return
    }

    try {
      setLoading(true)

      const formData = new FormData()
      formData.append('workoutPlanId', planId)

      const response = await deleteWorkoutPlanAction(null, formData)

      console.log('Response deleteWorkoutPlanAction:', response)

      if (response.data.success) {
        // Remove from local list
        setWorkoutPlans(workoutPlans.filter((plan) => plan.id !== planId))
        // Notify parent component
        if (onPlanDeleted) {
          onPlanDeleted()
        }
      } else {
        setError('Erro ao excluir plano de treino')
      }
    } catch (err) {
      console.error('Error deleting workout plan:', err)
      setError('Erro ao excluir plano de treino')
    } finally {
      setLoading(false)
    }
  }

  if (loading && workoutPlans.length === 0) {
    return (
      <Card className="mb-4">
        <CardContent className="pt-4">
          <div className="flex justify-center items-center h-20">
            <p className="text-muted-foreground">Carregando planos de treino...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div>
      <div>
        <Card className="mb-4">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Planos de Treino</CardTitle>
              {!onlyView ? (
                <Button size="sm" onClick={onAddNewPlan} variant="outline">
                  <PlusIcon className="h-4 w-4 mr-1" /> Novo Plano
                </Button>
              ) : null}
            </div>
          </CardHeader>
          <CardContent>
            {error && <div className="bg-red-50 text-red-500 p-3 rounded mb-4">{error}</div>}

            {workoutPlans.length === 0 ? (
              <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                <p className="text-gray-500 mb-2">Nenhum plano de treino encontrado</p>
                {!onlyView ? (
                  <Button variant="outline" size="sm" onClick={onAddNewPlan}>
                    <PlusIcon className="h-4 w-4 mr-1" /> Criar Plano de Treino
                  </Button>
                ) : null}
              </div>
            ) : (
              <div className="space-y-2">
                {workoutPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`p-3 rounded-md flex justify-between items-center cursor-pointer ${
                      selectedPlanId === plan.id
                        ? 'bg-purple-100 border border-purple-300'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => onSelectPlan(plan)}
                  >
                    <div className="flex-1">
                      <div className="font-medium">
                        Plano de {format(new Date(plan.start_date), 'dd/MM/yyyy')} a{' '}
                        {format(new Date(plan.end_date), 'dd/MM/yyyy')}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {plan.goal ? `Objetivo: ${plan.goal}` : 'Sem objetivo definido'}
                      </div>
                    </div>
                    {!onlyView ? (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            onEditPlan(plan)
                          }}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeletePlan(plan.id)
                          }}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
