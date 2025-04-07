'use client'

import React, { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Search, Plus, X, Loader, AlertCircle, RefreshCcw } from 'lucide-react'
import {
  searchExercisesAction,
  getAllExercisesAction,
  addExerciseAction,
} from '@/app/(frontend)/trainer/actions/exercises.action'
import { addExerciseWorkoutAction } from '@/app/(frontend)/trainer/actions/exerciseWorkout.action'
import { CreateExerciseForm } from './create-exercise-form'

interface AddExerciseToWorkoutProps {
  workoutPlanId: string
  onExerciseAdded: () => void
  onCancel: () => void
}

export function AddExerciseToWorkout({
  workoutPlanId,
  onExerciseAdded,
  onCancel,
}: AddExerciseToWorkoutProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [allExercises, setAllExercises] = useState([])
  const [filteredExercises, setFilteredExercises] = useState([])
  const [selectedExercise, setSelectedExercise] = useState(null)
  const [sets, setSets] = useState(3)
  const [reps, setReps] = useState(10)
  const [restSeconds, setRestSeconds] = useState(60)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showCreateForm, setShowCreateForm] = useState(false)

  // Extract exercises from different response formats
  function extractExercises(response) {
    console.log('Extracting exercises from response', response)

    // Case 1: Direct array at data level
    if (response.data && Array.isArray(response.data)) {
      console.log('Found exercises as direct array in data')
      return response.data
    }

    // Case 2: Docs inside data
    if (response.data && response.data.docs && Array.isArray(response.data.docs)) {
      console.log('Found exercises in data.docs')
      return response.data.docs
    }

    // Case 3: Docs at top level
    if (response.docs && Array.isArray(response.docs)) {
      console.log('Found exercises in top-level docs')
      return response.docs
    }

    // Case 4: Data is array
    if (Array.isArray(response)) {
      console.log('Found exercises as direct array')
      return response
    }

    // Default - return empty array if nothing found
    console.log('No exercises found in response format')
    return []
  }

  // Initial load of all exercises
  useEffect(() => {
    loadAllExercises()
  }, [])

  // Filter exercises when search query changes
  useEffect(() => {
    if (searchQuery.length < 2) {
      // Show all exercises if search query is too short
      setFilteredExercises(allExercises)
      return
    }

    // Filter exercises on the client if we have them loaded
    if (allExercises.length > 0) {
      const lowercaseQuery = searchQuery.toLowerCase()
      const filtered = allExercises.filter(
        (exercise) =>
          exercise.name.toLowerCase().includes(lowercaseQuery) ||
          (exercise.muscle_group && exercise.muscle_group.toLowerCase().includes(lowercaseQuery)),
      )

      setFilteredExercises(filtered)
    } else {
      // Otherwise search on the server
      searchServerExercises()
    }
  }, [searchQuery, allExercises])

  // Load all exercises using the action
  const loadAllExercises = async () => {
    try {
      setSearchLoading(true)
      setError(null)

      const formData = new FormData()
      const result = await getAllExercisesAction(null, formData)
      console.log('All exercises result:', result)

      // Extract exercises from response
      const exercisesList = extractExercises(result.data || result)
      console.log('Extracted exercises:', exercisesList.length)

      setAllExercises(exercisesList)
      setFilteredExercises(exercisesList)

      if (exercisesList.length === 0) {
        setError('Nenhum exercício encontrado no sistema. Crie um novo exercício.')
      }
    } catch (err) {
      console.error('Error loading all exercises:', err)
      setError('Erro ao carregar exercícios. Tente novamente.')
    } finally {
      setSearchLoading(false)
    }
  }

  // Search exercises on the server
  const searchServerExercises = async () => {
    if (searchQuery.length < 2) return

    try {
      setSearchLoading(true)
      setError(null)

      const formData = new FormData()
      formData.append('name', searchQuery)

      console.log('Searching exercises with query:', searchQuery)
      const result = await searchExercisesAction(null, formData)

      console.log('Exercise search result:', result)

      // Extract exercises from response
      const exercisesList = extractExercises(result.data || result)
      console.log('Extracted exercises from search:', exercisesList.length)

      setFilteredExercises(exercisesList)

      if (exercisesList.length === 0 && !error) {
        console.log('No exercises found in search, falling back to all exercises')
      }
    } catch (err) {
      console.error('Error searching exercises:', err)
      setError('Erro ao buscar exercícios. Tente novamente.')
    } finally {
      setSearchLoading(false)
    }
  }

  // Add exercise to workout
  const handleAddExerciseToWorkout = async () => {
    if (!selectedExercise || !workoutPlanId) {
      return
    }

    try {
      setLoading(true)
      setError(null)

      const formData = new FormData()
      formData.append('workoutPlanId', workoutPlanId)
      formData.append('exerciseId', selectedExercise.id.toString())
      formData.append('sets', sets.toString())
      formData.append('reps', reps.toString())
      formData.append('rest_seconds', restSeconds.toString())
      formData.append('notes', notes)

      console.log('Adding exercise to workout with data:', {
        workoutPlanId,
        exerciseId: selectedExercise.id,
        sets,
        reps,
        restSeconds,
        notes,
      })

      const result = await addExerciseWorkoutAction(null, formData)

      console.log('Response addExerciseWorkoutAction:', result)

      if (result.success !== false) {
        // Reset form
        setSelectedExercise(null)
        setSearchQuery('')
        setSets(3)
        setReps(10)
        setRestSeconds(60)
        setNotes('')

        // Notify parent component
        if (onExerciseAdded) {
          onExerciseAdded()
        }
      } else {
        setError(result.message || 'Erro ao adicionar exercício')
      }
    } catch (err) {
      console.error('Error adding exercise to workout:', err)
      setError('Falha ao adicionar exercício ao treino')
    } finally {
      setLoading(false)
    }
  }

  // Handle exercise creation
  const handleExerciseCreated = (newExercise) => {
    console.log('New exercise created:', newExercise)

    if (newExercise && newExercise.id) {
      setSelectedExercise(newExercise)
      setSearchQuery(newExercise.name)
      setShowCreateForm(false)

      // Reload all exercises to make sure the new one is in the list
      loadAllExercises()
    }
  }

  if (showCreateForm) {
    return (
      <CreateExerciseForm
        onExerciseCreated={handleExerciseCreated}
        onCancel={() => setShowCreateForm(false)}
      />
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Adicionar Exercício ao Treino</CardTitle>
      </CardHeader>
      <CardContent>
        {error && <div className="bg-red-50 text-red-500 p-3 rounded mb-4">{error}</div>}

        <div className="space-y-4">
          {/* Search for exercises */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Buscar Exercício:</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={loadAllExercises}
                disabled={searchLoading}
                className="h-6 px-2"
              >
                <RefreshCcw className="h-3 w-3 mr-1" />
                Atualizar
              </Button>
            </div>
            <div className="relative">
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Digite o nome do exercício"
                className="pl-10"
              />
              {searchLoading ? (
                <Loader className="absolute left-3 top-2.5 h-4 w-4 text-gray-400 animate-spin" />
              ) : (
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              )}
            </div>

            {/* Search results */}
            {filteredExercises.length > 0 ? (
              <div className="mt-2 border rounded max-h-48 overflow-y-auto">
                {filteredExercises.map((exercise) => (
                  <div
                    key={exercise.id}
                    className={`p-2 hover:bg-gray-100 cursor-pointer ${
                      selectedExercise?.id === exercise.id ? 'bg-purple-50' : ''
                    }`}
                    onClick={() => {
                      setSelectedExercise(exercise)
                      setSearchQuery(exercise.name)
                    }}
                  >
                    <p className="font-medium">{exercise.name}</p>
                    <p className="text-sm text-gray-600">
                      {exercise.muscle_group ? `Grupo muscular: ${exercise.muscle_group}` : ''}
                    </p>
                  </div>
                ))}
              </div>
            ) : searchLoading ? (
              <div className="mt-2 p-3 bg-gray-50 rounded border text-center">
                <Loader className="h-4 w-4 mx-auto text-gray-400 animate-spin mb-2" />
                <p className="text-gray-600 text-sm">Buscando exercícios...</p>
              </div>
            ) : (
              <div className="mt-2 p-3 bg-gray-50 rounded border">
                <p className="text-gray-600 text-sm flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2 text-amber-500" />
                  Nenhum exercício encontrado.
                </p>
                <Button
                  variant="link"
                  className="p-0 h-auto text-sm mt-1 text-purple-600"
                  onClick={() => setShowCreateForm(true)}
                >
                  Criar novo exercício
                </Button>
              </div>
            )}
          </div>

          {/* Selected exercise and details */}
          {selectedExercise && (
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>Exercício Selecionado:</Label>
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => {
                    setSelectedExercise(null)
                    setSearchQuery('')
                  }}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="p-2 border rounded bg-gray-50">
                <p className="font-medium">{selectedExercise.name}</p>
                <p className="text-sm text-gray-600">
                  {selectedExercise.muscle_group
                    ? `Grupo muscular: ${selectedExercise.muscle_group}`
                    : ''}
                </p>
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
          )}

          {!selectedExercise && filteredExercises.length === 0 && !searchLoading && (
            <div className="mt-4 text-center">
              <p className="text-gray-500 mb-2">Criar um novo exercício</p>
              <Button variant="outline" onClick={() => setShowCreateForm(true)} className="mt-1">
                Criar Exercício
              </Button>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button
          onClick={handleAddExerciseToWorkout}
          disabled={!selectedExercise || loading}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {loading ? (
            <Loader className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Plus className="h-4 w-4 mr-2" />
          )}
          Adicionar
        </Button>
      </CardFooter>
    </Card>
  )
}
