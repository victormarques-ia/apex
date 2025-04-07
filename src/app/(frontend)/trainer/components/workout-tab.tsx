'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import { format, isSameDay, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { PlusIcon, Trash2Icon, Edit2Icon, Loader } from 'lucide-react'
import {
  searchWorkoutPlansAction,
  deleteWorkoutPlanAction,
  getAthleteWorkoutPlansAction,
} from '@/app/(frontend)/trainer/actions/workoutPlan.action'
import {
  getAllExercisesWorkoutsAction,
  searchExerciseWorkoutsAction,
  deleteExerciseWorkoutAction,
} from '@/app/(frontend)/trainer/actions/exerciseWorkout.action'
import { WorkoutPlanForm } from './workout-plan-form'
import { WorkoutPlansList } from './workout-plans-list'
import { AddExerciseToWorkout } from './add-exercise-to-workout'
import { EditWorkoutExercises } from './edit-workout-exercises'

export function WorkoutTabContent({ athleteId, trainerId, onlyView = false }) {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [exercises, setExercises] = useState([])
  const [workoutDays, setWorkoutDays] = useState([])
  const [loading, setLoading] = useState(true)
  const [workoutPlan, setWorkoutPlan] = useState(null)
  const [workoutPlans, setWorkoutPlans] = useState([])
  const [showWorkoutPlanForm, setShowWorkoutPlanForm] = useState(false)
  const [isCreatingNewPlan, setIsCreatingNewPlan] = useState(false)
  const [showAddExerciseForm, setShowAddExerciseForm] = useState(false)
  const [showEditExercisesForm, setShowEditExercisesForm] = useState(false)
  const [selectedWorkoutId, setSelectedWorkoutId] = useState(null)
  const [deletingWorkout, setDeletingWorkout] = useState(false)
  const [selectedPlanId, setSelectedPlanId] = useState(null)

  // Helper function to transform API exercise workout data to the format expected by the component
  const transformExerciseWorkouts = (exerciseWorkouts) => {
    return exerciseWorkouts.map((workout) => {
      // Handle both possible data structures (depending on API depth parameter)
      const exerciseData =
        typeof workout.exercise === 'object'
          ? workout.exercise
          : { id: workout.exercise, name: 'Unknown Exercise' }

      return {
        id: workout.id,
        workout_id: workout.id,
        name: exerciseData.name,
        muscle_group: exerciseData.muscle_group,
        sets: workout.sets,
        reps: workout.reps,
        rest_seconds: workout.rest_seconds,
        notes: workout.notes,
        plan_id: workout.workout_plan?.id || workout.workout_plan, // Keep track of which plan this exercise belongs to
        created_at: workout.createdAt || workout.created_at, // Track creation date
        createdAt: workout.createdAt || workout.created_at, // Support both naming conventions
      }
    })
  }

  // Function to fetch workout plans and exercises for the selected date
  const fetchData = async () => {
    try {
      setLoading(true)

      if (athleteId) {
        const dateStr = selectedDate.toISOString().split('T')[0]
        const currentDate = new Date(dateStr)

        // Fetch all workout plans for this athlete (without date filter)
        const formData = new FormData()
        formData.append('athleteId', athleteId)

        let response = await getAthleteWorkoutPlansAction(null, formData)
        console.log('Workout plan response:', response)

        if (!response.data) {
          console.error('Workout plan fetch API error:', response.error)
          throw new Error('Erro ao buscar plano de treino')
        }

        // Extract all plans data
        const plansData = response.data.data || response.data
        const allPlans = plansData?.docs || []

        // Filter only plans that are valid for the selected date
        const availablePlans = allPlans.filter((plan) => {
          const startDate = new Date(plan.start_date)
          const endDate = new Date(plan.end_date)
          return currentDate >= startDate && currentDate <= endDate
        })

        // Store all available plans for this date
        setWorkoutPlans(availablePlans)

        // Only update selected plan if needed
        if (selectedPlanId) {
          // Check if the currently selected plan is still valid for this date
          const stillValid = availablePlans.some((plan) => plan.id === selectedPlanId)

          if (!stillValid) {
            // If previously selected plan is no longer valid, clear selection
            setSelectedPlanId(null)
            setWorkoutPlan(null)
          } else {
            // Keep the same plan selected if it's still valid
            const currentPlan = availablePlans.find((plan) => plan.id === selectedPlanId)
            setWorkoutPlan(currentPlan)
          }
        }

        // Only fetch exercises for workout plans that are valid for this date
        if (availablePlans.length > 0) {
          const allExercises = []

          for (const plan of availablePlans) {
            const exerciseFormData = new FormData()
            exerciseFormData.append('workoutPlanId', plan.id)

            try {
              const exerciseResponse = await getAllExercisesWorkoutsAction(null, exerciseFormData)
              if (exerciseResponse.data && exerciseResponse.data.docs) {
                const planExercises = transformExerciseWorkouts(exerciseResponse.data.docs)

                // Filter exercises to only include those created on the selected date
                const filteredExercises = planExercises.filter((exercise) => {
                  // If exercise has a created_at property, use it
                  if (exercise.created_at) {
                    const exerciseDate = new Date(exercise.created_at).toISOString().split('T')[0]
                    return exerciseDate === dateStr
                  }

                  // If exercise has a createdAt property, use it
                  if (exercise.createdAt) {
                    const exerciseDate = new Date(exercise.createdAt).toISOString().split('T')[0]
                    return exerciseDate === dateStr
                  }

                  // If no creation date is available, include the exercise if it was just added
                  // (This handles newly added exercises in the current session)
                  if (exercise.justAdded) {
                    return true
                  }

                  // Default: show exercise only on selected date
                  return isSameDay(new Date(), selectedDate)
                })

                allExercises.push(...filteredExercises)
              }
            } catch (err) {
              console.error(`Error fetching exercises for plan ${plan.id}:`, err)
            }
          }

          setExercises(allExercises)
        } else {
          // No plans found for this date
          setExercises([])
          // We don't clear selectedPlanId here, to preserve selection when changing dates
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setWorkoutPlans([])
      setExercises([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (athleteId) fetchData()
  }, [athleteId, selectedDate])

  // Function to refresh data after workout plan actions
  const refreshData = async () => {
    await fetchData()
  }

  // Sort exercises by muscle group for display
  const getSortedExercises = () => {
    if (!exercises || exercises.length === 0) return []
    return [...exercises].sort((a, b) => {
      if (a.muscle_group === b.muscle_group) {
        return a.name.localeCompare(b.name)
      }
      return (a.muscle_group || '').localeCompare(b.muscle_group || '')
    })
  }

  const handleWorkoutPlanCreated = () => {
    refreshData()
    setShowWorkoutPlanForm(false)
    setIsCreatingNewPlan(false)
  }

  const handleWorkoutPlanUpdated = () => {
    refreshData()
  }

  const handleSelectPlan = (plan) => {
    console.log('Plan selected:', plan)
    setWorkoutPlan(plan)
    setSelectedPlanId(plan.id)

    // Hide workout plan form
    setShowWorkoutPlanForm(false)
    setIsCreatingNewPlan(false)
  }

  const handleEditPlan = (plan) => {
    setWorkoutPlan(plan)
    // Do not clear selectedPlanId here to maintain selection

    // Show workout plan form
    setShowWorkoutPlanForm(true)
    setIsCreatingNewPlan(false)
  }

  const handleAddNewPlan = () => {
    setWorkoutPlan(null)
    // Keep selectedPlanId to maintain selection after creation
    setIsCreatingNewPlan(true)
    setShowWorkoutPlanForm(true)
  }

  const handleDeleteExercise = async (exerciseWorkoutId) => {
    if (!confirm('Tem certeza que deseja excluir este exercício?')) {
      return
    }

    setDeletingWorkout(true)
    try {
      const formData = new FormData()
      formData.append('exerciseWorkoutId', exerciseWorkoutId)
      const result = await deleteExerciseWorkoutAction(null, formData)

      if (result.data.success) {
        // Remove exercise from local state to avoid refetching all data
        setExercises((prevExercises) =>
          prevExercises.filter((exercise) => exercise.workout_id !== exerciseWorkoutId),
        )
      } else {
        alert('Erro ao excluir exercício: ' + (result.message || 'Erro desconhecido'))
      }
    } catch (error) {
      console.error('Error deleting exercise:', error)
      alert('Erro ao excluir exercício')
    } finally {
      setDeletingWorkout(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[600px] flex items-center justify-center">
        <Loader className="h-6 w-6 animate-spin mr-2" />
        <span>Carregando...</span>
      </div>
    )
  }

  // Dates with workouts come directly from the API's dateRange
  const datesWithWorkouts = workoutDays.map((day) => new Date(day.date))

  return (
    <div className="space-y-6">
      {/* List of workout plans */}
      {athleteId && (
        <WorkoutPlansList
          athleteId={athleteId}
          onSelectPlan={handleSelectPlan}
          onEditPlan={handleEditPlan}
          onAddNewPlan={handleAddNewPlan}
          onPlanDeleted={refreshData}
          selectedPlanId={selectedPlanId}
          onlyView={onlyView}
        />
      )}

      {showWorkoutPlanForm ? (
        <WorkoutPlanForm
          athleteId={athleteId}
          trainerId={trainerId}
          selectedDate={selectedDate}
          workoutPlan={workoutPlan}
          isCreatingNewPlan={isCreatingNewPlan}
          onWorkoutPlanCreated={handleWorkoutPlanCreated}
          onWorkoutPlanUpdated={handleWorkoutPlanUpdated}
          onBackToCalendar={() => setShowWorkoutPlanForm(false)}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Calendário de Treinos</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar selectedDate={selectedDate} onDateChange={setSelectedDate} />
              </CardContent>
              <CardFooter>
                {isCreatingNewPlan ? (
                  <Button
                    className="w-full"
                    onClick={() => {
                      setShowWorkoutPlanForm(false)
                      setIsCreatingNewPlan(false)
                    }}
                  >
                    Cancelar
                  </Button>
                ) : selectedPlanId && !onlyView ? (
                  <Button
                    className="w-full"
                    onClick={() => {
                      setShowAddExerciseForm(true)
                    }}
                  >
                    {'Adicionar Exercício'}
                  </Button>
                ) : !onlyView ? (
                  <Button className="w-full" onClick={handleAddNewPlan}>
                    Adicionar Plano
                  </Button>
                ) : null}
              </CardFooter>
            </Card>
          </div>

          {/* Workout Details */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  {format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {exercises.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum exercício registrado</p>
                ) : (
                  <ul className="space-y-2">
                    {getSortedExercises().map((exercise) => (
                      <li key={exercise.id} className="bg-green-50 p-3 rounded-md">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-medium capitalize">{exercise.name}</span>
                            <p className="text-xs text-muted-foreground">
                              {exercise.muscle_group
                                ? `Grupo muscular: ${exercise.muscle_group}`
                                : ''}
                            </p>
                          </div>
                          {!onlyView ? (
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 rounded-full bg-white hover:bg-gray-100"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedWorkoutId(exercise.workout_id)
                                  setShowEditExercisesForm(true)
                                }}
                                title="Editar exercício"
                              >
                                <Edit2Icon className="h-3 w-3" />
                              </Button>

                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 rounded-full bg-white hover:bg-gray-100 hover:text-red-600"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteExercise(exercise.workout_id)
                                }}
                                disabled={deletingWorkout}
                                title="Excluir exercício"
                              >
                                <Trash2Icon className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : null}
                        </div>

                        <div className="flex flex-wrap gap-2 mt-1 text-xs text-muted-foreground">
                          <span>
                            {exercise.sets} séries x {exercise.reps} repetições
                            {exercise.rest_seconds ? ` | Descanso: ${exercise.rest_seconds}s` : ''}
                          </span>
                        </div>

                        {exercise.notes && (
                          <div className="text-xs italic mt-1 text-gray-500">{exercise.notes}</div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Add Exercise Form */}
      {showAddExerciseForm && selectedPlanId && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="max-w-md w-full">
            <AddExerciseToWorkout
              workoutPlanId={selectedPlanId}
              onExerciseAdded={() => {
                setShowAddExerciseForm(false)
                refreshData()
              }}
              onCancel={() => setShowAddExerciseForm(false)}
            />
          </div>
        </div>
      )}

      {/* Edit Exercise Form */}
      {showEditExercisesForm && selectedWorkoutId && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="max-w-xl w-full">
            <EditWorkoutExercises
              exerciseWorkoutId={selectedWorkoutId}
              exercise={exercises.find((exercise) => exercise.workout_id === selectedWorkoutId)}
              onExerciseUpdated={() => {
                refreshData()
                setShowEditExercisesForm(false)
              }}
              onCancel={() => setShowEditExercisesForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
