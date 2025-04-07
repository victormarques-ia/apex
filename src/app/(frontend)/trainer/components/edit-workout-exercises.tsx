'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader, Save, AlertCircle } from 'lucide-react'
import { updateExerciseWorkoutsAction } from '@/app/(frontend)/trainer/actions/exerciseWorkout.action'

interface EditWorkoutExercisesProps {
  exerciseWorkoutId: string
  exercise: any
  onExerciseUpdated: () => void
  onCancel: () => void
}

export function EditWorkoutExercises({
  exerciseWorkoutId,
  exercise,
  onExerciseUpdated,
  onCancel,
}: EditWorkoutExercisesProps) {
  const [sets, setSets] = useState(exercise?.sets || 3)
  const [reps, setReps] = useState(exercise?.reps || 10)
  const [restSeconds, setRestSeconds] = useState(exercise?.rest_seconds || 60)
  const [notes, setNotes] = useState(exercise?.notes || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize form with exercise data when it changes
  useEffect(() => {
    if (exercise) {
      setSets(exercise.sets || 3)
      setReps(exercise.reps || 10)
      setRestSeconds(exercise.rest_seconds || 60)
      setNotes(exercise.notes || '')
    }
  }, [exercise])

  if (!exercise) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Editar Exercício</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6">
            <AlertCircle className="h-10 w-10 text-amber-500 mb-2" />
            <p className="text-gray-500">Exercício não encontrado</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={onCancel} className="w-full">
            Voltar
          </Button>
        </CardFooter>
      </Card>
    )
  }

  // Update exercise
  const handleUpdateExercise = async () => {
    try {
      setLoading(true)
      setError(null)

      const formData = new FormData()
      formData.append('exerciseWorkoutId', exerciseWorkoutId)
      formData.append('sets', sets.toString())
      formData.append('reps', reps.toString())
      formData.append('rest_seconds', restSeconds.toString())
      formData.append('notes', notes)

      console.log('Updating exercise workout with data:', {
        exerciseWorkoutId,
        sets,
        reps,
        restSeconds,
        notes,
      })

      const response = await updateExerciseWorkoutsAction(null, formData)
      console.log('Update exercise response:', response)

      const isSuccess = response.success || (response.data && response.data.success)

      if (isSuccess) {
        onExerciseUpdated()
      } else {
        const errorMessage =
          response.message || (response.data && response.data.message) || 'Erro desconhecido'
        setError(errorMessage)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar exercício'
      setError(errorMessage)
      console.error('Error updating exercise:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Editar Exercício</CardTitle>
      </CardHeader>
      <CardContent>
        {error && <div className="bg-red-50 text-red-500 p-3 rounded mb-4">{error}</div>}

        <div className="space-y-4">
          <div className="border-b pb-2 mb-4">
            <h3 className="font-medium text-lg">{exercise?.name}</h3>
            <p className="text-sm text-gray-600">{exercise?.muscle_group || ''}</p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="sets">Séries:</Label>
              <Input
                id="sets"
                type="number"
                value={sets}
                onChange={(e) => setSets(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
              />
            </div>
            <div>
              <Label htmlFor="reps">Repetições:</Label>
              <Input
                id="reps"
                type="number"
                value={reps}
                onChange={(e) => setReps(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
              />
            </div>
            <div>
              <Label htmlFor="restSeconds">Descanso (seg):</Label>
              <Input
                id="restSeconds"
                type="number"
                value={restSeconds}
                onChange={(e) => setRestSeconds(Math.max(0, parseInt(e.target.value) || 0))}
                min="0"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Observações:</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Adicione observações para este exercício"
              className="min-h-[80px]"
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          onClick={handleUpdateExercise}
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {loading ? (
            <Loader className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Salvar Alterações
        </Button>
      </CardFooter>
    </Card>
  )
}
