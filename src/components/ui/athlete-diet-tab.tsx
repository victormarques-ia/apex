'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import { format, isSameDay, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Loader } from 'lucide-react'

type MealFood = {
  id: string
  food: {
    id: string
    name: string
  }
  quantity: number
}

type Meal = {
  id?: string
  meal_type?: string
  mealType?: string
  scheduled_time?: string
  scheduledTime?: string
  foods?: MealFood[]
  notes?: string
  status?: string
  time?: string
  activity?: string
  details?: string
  type?: string
  dietPlanId?: string
  diet_plan?: any
}

type DietPlan = {
  id: string
  name?: string
  start_date: string
  end_date: string
  notes?: string
  nutritionist?: any
  total_daily_calories?: number
  color?: any
}

// Define an array of colors for different diet plans
const DIET_PLAN_COLORS = [
  { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
]

export function AthleteReadOnlyDietTab() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [meals, setMeals] = useState<Meal[]>([])
  const [loading, setLoading] = useState(true)
  const [dietPlans, setDietPlans] = useState<DietPlan[]>([])
  const [error, setError] = useState<string | null>(null)
  const [coloredMeals, setColoredMeals] = useState<any[]>([])

  const onDateChange = (date: Date) => {
    setSelectedDate(date)
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Format the date for the API
        const formattedDate = format(selectedDate, 'yyyy-MM-dd')

        // Fetch activities data from the API
        const response = await fetch(`/api/athlete-profiles/get-activities?date=${formattedDate}`)
        if (!response.ok) {
          throw new Error(`Error fetching diet data: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()

        if (data?.data) {
          // Get diet plans data and assign colors to each plan
          const fetchedDietPlans = data.data.dietPlans || []
          const coloredDietPlans = fetchedDietPlans.map((plan: DietPlan, index: number) => ({
            ...plan,
            color: DIET_PLAN_COLORS[index % DIET_PLAN_COLORS.length],
          }))

          // Create a dietPlanMap for quick lookup by ID
          const dietPlanMap: Record<string, DietPlan> = {}
          coloredDietPlans.forEach((plan) => {
            dietPlanMap[plan.id] = plan
          })

          setDietPlans(coloredDietPlans)

          // Extract meals from activities
          const mealActivities = data.data.activities.filter(
            (activity: any) => activity.type === 'meal',
          )

          // Transform activities and assign colors
          const processed = mealActivities.map((activity: any) => {
            // Get diet plan ID from activity
            let dietPlanId = ''

            // If diet_plan is an object with id property
            if (
              activity.diet_plan &&
              typeof activity.diet_plan === 'object' &&
              activity.diet_plan.id
            ) {
              dietPlanId = activity.diet_plan.id
            }
            // If diet_plan is a string ID
            else if (activity.diet_plan && typeof activity.diet_plan === 'string') {
              dietPlanId = activity.diet_plan
            }

            // Lookup diet plan to get color
            const dietPlan = dietPlanMap[dietPlanId]
            const color = dietPlan?.color || DIET_PLAN_COLORS[0]

            console.log(`Meal ${activity.activity} has diet plan ID ${dietPlanId}, color:`, color)

            return {
              ...activity,
              dietPlanId: dietPlanId,
              mealType: activity.activity,
              scheduledTime: activity.time,
              color: color,
            }
          })

          setColoredMeals(processed)
          setMeals(processed)
        } else {
          setDietPlans([])
          setMeals([])
          setColoredMeals([])
        }
      } catch (error) {
        console.error('Error fetching diet data:', error)
        setError('Falha ao carregar dados do plano alimentar')
        setDietPlans([])
        setMeals([])
        setColoredMeals([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [selectedDate])

  const formatTime = (timeString?: string): string => {
    if (!timeString) return ''

    // Handle cases where the timeString might be just "HH:MM"
    if (timeString.length === 5) {
      return timeString
    }

    try {
      const date = new Date(`2025-01-01T${timeString}`)
      return format(date, 'HH:mm')
    } catch {
      return timeString
    }
  }

  // Group meals by diet plan and type
  const groupMealsByDietPlanAndType = () => {
    const grouped: Record<string, Record<string, any[]>> = {}

    // Initialize all diet plans in the structure
    dietPlans.forEach((plan) => {
      grouped[plan.id] = {}
    })

    coloredMeals.forEach((meal) => {
      // Use the dietPlanId that was assigned during processing
      const dietPlanId = meal.dietPlanId || 'unknown'
      const mealType = meal.mealType || 'unknown'

      if (!grouped[dietPlanId]) {
        grouped[dietPlanId] = {}
      }

      if (!grouped[dietPlanId][mealType]) {
        grouped[dietPlanId][mealType] = []
      }

      grouped[dietPlanId][mealType].push(meal)
    })

    return grouped
  }

  if (loading) {
    return (
      <div className="min-h-[600px] flex items-center justify-center">
        <Loader className="h-6 w-6 animate-spin mr-2" />
        <span>Carregando...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[600px] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-2">{error}</p>
          <button onClick={() => window.location.reload()} className="text-blue-500 underline">
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  const groupedMeals = groupMealsByDietPlanAndType()

  return (
    <div className="space-y-6">
      {/* Diet Plans */}
      {dietPlans.length > 0 ? (
        <div className="space-y-4">
          {dietPlans.map((plan, index) => (
            <div
              key={plan.id}
              className={`${plan.color?.bg} p-4 rounded-lg border ${plan.color?.border}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className={`font-medium ${plan.color?.text}`}>
                    Plano Alimentar {index + 1}
                    {plan.name && `: ${plan.name}`}
                  </h3>
                  {plan.start_date && plan.end_date && (
                    <p className={`text-sm ${plan.color?.text} mt-1`}>
                      {format(new Date(plan.start_date), 'dd/MM/yyyy')} -{' '}
                      {format(new Date(plan.end_date), 'dd/MM/yyyy')}
                    </p>
                  )}
                </div>
                {plan.total_daily_calories && (
                  <div className={`text-sm font-medium ${plan.color?.text}`}>
                    {plan.total_daily_calories} calorias/dia
                  </div>
                )}
              </div>
              {plan.notes && (
                <p className={`text-sm ${plan.color?.text} mt-2 italic`}>
                  &ldquo;{plan.notes}&rdquo;
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">
            Nenhum plano alimentar encontrado para o período selecionado.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Calendário de Dietas</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                selectedDate={selectedDate}
                onDateChange={onDateChange}
                defaultMonth={selectedDate}
                locale={ptBR}
              />
            </CardContent>
          </Card>
        </div>

        {/* Meal details */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                {format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.keys(groupedMeals).length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhuma refeição registrada para esta data
                </p>
              ) : (
                Object.entries(groupedMeals).map(([dietPlanId, mealsByType]) => {
                  const plan = dietPlans.find((p) => p.id === dietPlanId)

                  return (
                    <div key={dietPlanId} className="mb-6">
                      {plan && (
                        <div
                          className={`${plan.color?.bg} p-2 rounded-md mb-2 border ${plan.color?.border}`}
                        >
                          <span className={`text-sm font-medium ${plan.color?.text}`}>
                            {plan.name ||
                              `Plano Alimentar ${dietPlans.findIndex((p) => p.id === dietPlanId) + 1}`}
                          </span>
                        </div>
                      )}

                      {Object.entries(mealsByType).map(([mealType, mealList]) => (
                        <div key={`${dietPlanId}-${mealType}`}>
                          {mealList.map((meal, index) => {
                            // Use the color directly from the meal object
                            const mealColor = meal.color

                            return (
                              <div
                                key={index}
                                className={`${mealColor.bg} p-3 rounded-md mb-3 border ${mealColor.border}`}
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <span className={`font-medium capitalize ${mealColor.text}`}>
                                      {mealType}
                                    </span>
                                  </div>
                                  {meal.scheduledTime && (
                                    <span className="text-xs text-muted-foreground">
                                      {formatTime(meal.scheduledTime)}
                                    </span>
                                  )}
                                </div>

                                {/* Food items */}
                                {meal.foods && meal.foods.length > 0 ? (
                                  <div className="mt-2 text-sm">
                                    <p className={`text-xs font-medium mb-1 ${mealColor.text}`}>
                                      Alimentos:
                                    </p>
                                    <ul className="space-y-1 pl-2">
                                      {meal.foods.map((foodItem, idx) => (
                                        <li key={idx} className="flex justify-between">
                                          <span>{foodItem.food?.name || foodItem.name}</span>
                                          <span className="text-muted-foreground">
                                            {foodItem.quantity}g
                                          </span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                ) : meal.details ? (
                                  <div className="mt-2 text-sm">
                                    <p className={`text-xs font-medium mb-1 ${mealColor.text}`}>
                                      Detalhes:
                                    </p>
                                    <p className="text-gray-600 whitespace-pre-line">
                                      {meal.details}
                                    </p>
                                  </div>
                                ) : null}
                              </div>
                            )
                          })}
                        </div>
                      ))}
                    </div>
                  )
                })
              )}

              {/* Additional information to help the athlete */}
              {Object.keys(groupedMeals).length === 0 && (
                <div className="mt-8 space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Informação</h4>
                    <p className="text-xs text-gray-600">
                      Seu nutricionista ainda não registrou refeições para esta data. Você pode
                      consultar outras datas no calendário ou entrar em contato com seu
                      nutricionista para mais informações.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
