'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import {
  addWorkoutPlanAction,
  updateWorkoutPlansAction,
} from '@/app/(frontend)/trainer/actions/workoutPlan.action'

interface WorkoutPlanFormProps {
  athleteId: string
  trainerId: string
  selectedDate: Date
  workoutPlan: any
  isCreatingNewPlan: boolean
  onWorkoutPlanCreated: () => void
  onWorkoutPlanUpdated?: () => void
  onBackToCalendar?: () => void
}

export function WorkoutPlanForm({
  athleteId,
  trainerId,
  selectedDate,
  workoutPlan,
  isCreatingNewPlan,
  onWorkoutPlanCreated,
  onWorkoutPlanUpdated = () => {},
  onBackToCalendar,
}: WorkoutPlanFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [startDate, setStartDate] = useState<Date>(new Date())
  const [endDate, setEndDate] = useState<Date>(
    new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
  )
  const [goal, setGoal] = useState<string>('')

  // Format the date for display
  const formattedDate = selectedDate.toISOString().split('T')[0]

  // Initialize form with existing workout plan data if available
  useEffect(() => {
    if (workoutPlan) {
      if (workoutPlan.start_date) {
        setStartDate(new Date(workoutPlan.start_date))
      }
      if (workoutPlan.end_date) {
        setEndDate(new Date(workoutPlan.end_date))
      }
      if (workoutPlan.goal) {
        setGoal(workoutPlan.goal)
      }
    }
  }, [workoutPlan])

  // Create a new workout plan
  const handleCreateWorkoutPlan = async () => {
    try {
      setLoading(true)
      setError(null)

      const formData = new FormData()
      formData.append('athleteId', athleteId)
      formData.append('startDate', startDate.toISOString().split('T')[0])
      formData.append('endDate', endDate.toISOString().split('T')[0])
      formData.append('goal', goal)

      const response = await addWorkoutPlanAction(null, formData)

      console.log('Response addWorkoutPlanAction: ', response)

      if (response.data) {
        if (onWorkoutPlanCreated) {
          onWorkoutPlanCreated()
        }
      } else {
        setError(response.message || 'Erro ao criar plano de treino')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar plano de treino'
      setError(errorMessage)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Update an existing workout plan
  const handleUpdateWorkoutPlan = async () => {
    if (!workoutPlan || !workoutPlan.id) {
      setError('Nenhum plano de treino selecionado')
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Update the workout plan
      const planFormData = new FormData()
      planFormData.append('workoutPlanId', workoutPlan.id)
      planFormData.append('startDate', startDate.toISOString().split('T')[0])
      planFormData.append('endDate', endDate.toISOString().split('T')[0])
      planFormData.append('goal', goal)

      const planResponse = await updateWorkoutPlansAction(null, planFormData)

      console.log('====================')
      console.log('Response updateWorkoutPlansAction:', planResponse)
      console.log('====================')

      if (planResponse.data) {
        if (onWorkoutPlanUpdated) {
          onWorkoutPlanUpdated()
        }
        alert('Plano de treino atualizado com sucesso!')
      } else {
        setError(planResponse.message || 'Erro ao atualizar plano de treino')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar plano de treino'
      setError(errorMessage)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const renderWorkoutPlanForm = () => {
    if (isCreatingNewPlan) {
      return (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Criar Novo Plano de Treino</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">Data de Início</Label>
              <div className="mb-4">
                <Calendar
                  selectedDate={startDate}
                  onDateChange={(date) => {
                    console.log('Setting start date:', date)
                    setStartDate(date)
                  }}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="end_date">Data de Término</Label>
              <div className="mb-4">
                <Calendar
                  selectedDate={endDate}
                  onDateChange={(date) => {
                    console.log('Setting end date:', date)
                    if (date >= startDate) {
                      setEndDate(date)
                    } else {
                      alert('A data de término deve ser posterior à data de início')
                    }
                  }}
                />
              </div>
            </div>
          </div>
          <div>
            <Label htmlFor="goal">Objetivo</Label>
            <Textarea
              id="goal"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="Adicione o objetivo deste plano de treino"
              className="min-h-[100px]"
            />
          </div>

          <Button className="w-full" onClick={handleCreateWorkoutPlan} disabled={loading}>
            Criar Plano de Treino
          </Button>
        </div>
      )
    } else if (workoutPlan) {
      // Render existing workout plan
      return (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Editar Plano de Treino</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">Data de Início</Label>
              <div className="mb-4">
                <Calendar
                  selectedDate={startDate}
                  onDateChange={(date) => {
                    console.log('Setting start date:', date)
                    setStartDate(date)
                  }}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="end_date">Data de Término</Label>
              <div className="mb-4">
                <Calendar
                  selectedDate={endDate}
                  onDateChange={(date) => {
                    console.log('Setting end date:', date)
                    if (date >= startDate) {
                      setEndDate(date)
                    } else {
                      alert('A data de término deve ser posterior à data de início')
                    }
                  }}
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="goal">Objetivo</Label>
            <Textarea
              id="goal"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="Adicione o objetivo deste plano de treino"
              className="min-h-[80px]"
            />
          </div>

          <div className="flex gap-2 mt-4">
            <Button className="w-full" onClick={handleUpdateWorkoutPlan} disabled={loading}>
              Salvar Alterações
            </Button>
          </div>
        </div>
      )
    } else {
      // No plan selected and not creating a new one - show instructions
      return (
        <div className="space-y-4">
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
            <p className="text-gray-500 mb-2">
              Selecione um plano de treino na lista acima ou crie um novo
            </p>
          </div>
        </div>
      )
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            {onBackToCalendar && (
              <Button size="sm" variant="ghost" onClick={onBackToCalendar} className="mr-2">
                ← Voltar
              </Button>
            )}
            <div>
              <CardTitle>Configuração do Plano de Treino</CardTitle>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error && <div className="bg-red-50 text-red-500 p-3 rounded mb-4">{error}</div>}

        {renderWorkoutPlanForm()}
      </CardContent>
    </Card>
  )
}
