'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import { format, isSameDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'

type MealFood = {
  id: string
  food: {
    id: string
    name: string
  }
  quantity: number
}

type Meal = {
  id: string
  mealType: string
  scheduledTime?: string
  foods: MealFood[]
  isRepeated?: boolean
}

type DietPlanDay = {
  id: string
  date: string
  meals: Meal[]
  nutritionalSummary?: {
    calories: number
    protein: number
    carbs: number
    fat: number
    notes?: string
  }
  diet_plan: {
    id: string
    name?: string
    start_date?: string
    end_date?: string
    notes?: string
  }
}

export function AthleteReadOnlyDietTab({ athleteId }: { athleteId: string }) {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [meals, setMeals] = useState<Meal[]>([])
  const [dietDays, setDietDays] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [dietPlanDay, setDietPlanDay] = useState<DietPlanDay | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        if (athleteId) {
          const dateStr = selectedDate.toISOString().split('T')[0]

          // Fetch diet plan day for the selected date
          const response = await fetch(`/api/athlete-profiles/${athleteId}/diet?date=${dateStr}`)
          const data = await response.json()

          if (data.success && data.data) {
            setDietPlanDay(data.data)
            setMeals(data.data.meals || [])

            // Extract dates with meals for calendar highlighting
            if (data.data.availableDates) {
              setDietDays(data.data.availableDates)
            }
          } else {
            setDietPlanDay(null)
            setMeals([])
          }
        }
      } catch (error) {
        console.error('Error fetching diet data:', error)
        setDietPlanDay(null)
        setMeals([])
      } finally {
        setLoading(false)
      }
    }

    // If no actual data is returned from API, use mock data
    const setMockData = () => {
      const mockDietPlanDay: DietPlanDay = {
        id: 'mock-1',
        date: selectedDate.toISOString().split('T')[0],
        meals: [
          {
            id: 'meal-1',
            mealType: 'breakfast',
            scheduledTime: '07:00:00',
            foods: [
              {
                id: 'food-1',
                food: { id: 'f1', name: 'Aveia' },
                quantity: 40,
              },
              {
                id: 'food-2',
                food: { id: 'f2', name: 'Banana' },
                quantity: 100,
              },
            ],
          },
          {
            id: 'meal-2',
            mealType: 'lunch',
            scheduledTime: '12:00:00',
            foods: [
              {
                id: 'food-3',
                food: { id: 'f3', name: 'Arroz integral' },
                quantity: 150,
              },
              {
                id: 'food-4',
                food: { id: 'f4', name: 'Frango grelhado' },
                quantity: 120,
              },
              {
                id: 'food-5',
                food: { id: 'f5', name: 'Salada verde' },
                quantity: 100,
              },
            ],
          },
          {
            id: 'meal-3',
            mealType: 'afternoon_snack',
            scheduledTime: '16:00:00',
            foods: [
              {
                id: 'food-6',
                food: { id: 'f6', name: 'Iogurte natural' },
                quantity: 170,
              },
              {
                id: 'food-7',
                food: { id: 'f7', name: 'Granola' },
                quantity: 30,
              },
            ],
          },
          {
            id: 'meal-4',
            mealType: 'dinner',
            scheduledTime: '20:00:00',
            foods: [
              {
                id: 'food-8',
                food: { id: 'f8', name: 'Batata doce' },
                quantity: 150,
              },
              {
                id: 'food-9',
                food: { id: 'f9', name: 'Ovo cozido' },
                quantity: 100,
              },
            ],
          },
        ],
        nutritionalSummary: {
          calories: 1850,
          protein: 95,
          carbs: 220,
          fat: 45,
          notes: 'Mantenha-se hidratado e consuma as refeições nos horários estabelecidos.',
        },
        diet_plan: {
          id: 'plan-1',
          name: 'Plano para definição muscular',
          start_date: '2025-03-01',
          end_date: '2025-06-30',
          notes: 'Plano baseado na necessidade de preparação para competição',
        },
      }

      setDietPlanDay(mockDietPlanDay)
      setMeals(mockDietPlanDay.meals)

      // Mock dates with meals for calendar
      const mockDates = []
      const currentDate = new Date()
      for (let i = -5; i < 10; i++) {
        const date = new Date()
        date.setDate(currentDate.getDate() + i)
        if (i % 2 === 0) {
          // Only add every other day
          mockDates.push(date.toISOString().split('T')[0])
        }
      }
      setDietDays(mockDates)
    }

    if (athleteId) {
      fetchData().catch((error) => {
        console.error('Failed to fetch diet data, using mock data', error)
        setMockData()
      })
    } else {
      setMockData()
    }
  }, [athleteId, selectedDate])

  const translateMealType = (type: string): string => {
    const types: Record<string, string> = {
      breakfast: 'Café da manhã',
      morning_snack: 'Lanche da manhã',
      lunch: 'Almoço',
      afternoon_snack: 'Lanche da tarde',
      dinner: 'Jantar',
      supper: 'Ceia',
    }
    return types[type] || type
  }

  const formatTime = (timeString?: string): string => {
    if (!timeString) return ''
    try {
      const date = new Date(`2025-01-01T${timeString}`)
      return format(date, 'HH:mm')
    } catch {
      return ''
    }
  }

  if (loading) {
    return <div className="min-h-[600px] flex items-center justify-center">Carregando...</div>
  }

  // Dates with meals for calendar highlighting
  const datesWithMeals = dietDays.map((dateStr) => new Date(dateStr))

  return (
    <div className="space-y-6">
      {dietPlanDay?.diet_plan && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-medium text-blue-800">Plano Alimentar Atual</h3>
          <p className="text-sm text-blue-700 mt-1">
            {dietPlanDay.diet_plan.name || 'Plano personalizado'}
            {dietPlanDay.diet_plan.start_date && dietPlanDay.diet_plan.end_date && (
              <span className="ml-2 text-blue-600">
                ({format(new Date(dietPlanDay.diet_plan.start_date), 'dd/MM/yyyy')} -{' '}
                {format(new Date(dietPlanDay.diet_plan.end_date), 'dd/MM/yyyy')})
              </span>
            )}
          </p>
          {dietPlanDay.diet_plan.notes && (
            <p className="text-sm text-blue-600 mt-2 italic">
              &ldquo;{dietPlanDay.diet_plan.notes}&rdquo;
            </p>
          )}
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
                onDateChange={setSelectedDate}
                modifiers={{
                  hasMeals: (date) => datesWithMeals.some((d) => isSameDay(d, date)),
                }}
                modifiersStyles={{
                  hasMeals: {
                    border: '2px solid #10B981',
                  },
                }}
              />
              <div className="mt-4 text-xs text-gray-500">
                <div className="flex items-center mb-1">
                  <div className="w-3 h-3 border-2 border-green-500 rounded-full mr-2"></div>
                  <span>Dias com refeições planejadas</span>
                </div>
                <p className="mt-2">
                  Selecione uma data para visualizar seu plano alimentar para aquele dia.
                </p>
              </div>
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
              {meals.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhuma refeição registrada para esta data
                </p>
              ) : (
                meals.map((meal) => (
                  <div key={meal.id}>
                    <h3 className="font-medium mb-2">{translateMealType(meal.mealType)}</h3>
                    <div
                      className={`${meal.isRepeated ? 'bg-gray-50' : 'bg-blue-50'} p-3 rounded-md`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-medium capitalize">
                            {translateMealType(meal.mealType)}
                          </span>
                          {meal.isRepeated && (
                            <span className="ml-2 text-xs bg-gray-200 px-1.5 py-0.5 rounded-full">
                              Repetida
                            </span>
                          )}
                        </div>
                        {meal.scheduledTime && (
                          <span className="text-xs text-muted-foreground">
                            {formatTime(meal.scheduledTime)}
                          </span>
                        )}
                      </div>

                      {/* Food items */}
                      {meal.foods && meal.foods.length > 0 && (
                        <div className="mt-2 text-sm">
                          <p className="text-xs font-medium mb-1">Alimentos:</p>
                          <ul className="space-y-1 pl-2">
                            {meal.foods.map((foodItem) => (
                              <li key={foodItem.id} className="flex justify-between">
                                <span>{foodItem.food.name}</span>
                                <span className="text-muted-foreground">{foodItem.quantity}g</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}

              {/* Additional information to help the athlete */}
              {meals.length === 0 && (
                <div className="mt-8 space-y-4">
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Informação</h4>
                    <p className="text-xs text-gray-600">
                      Seu nutricionista ainda não registrou refeições para esta data. Você pode
                      consultar outras datas no calendário ou entrar em contato com seu
                      nutricionista para mais informações.
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <h4 className="text-sm font-medium text-blue-700 mb-2">Dica</h4>
                    <p className="text-xs text-blue-600">
                      Lembre-se de seguir o plano alimentar recomendado todos os dias, mesmo para
                      datas sem detalhamento. Mantenha uma rotina de alimentação saudável e
                      hidratação adequada.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Display Daily Nutrition Summary if available */}
      {dietPlanDay?.nutritionalSummary && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Resumo Nutricional do Dia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-red-50 p-3 rounded-md">
                <p className="text-xs text-red-700 mb-1">Calorias</p>
                <p className="text-lg font-medium">
                  {dietPlanDay.nutritionalSummary.calories || 0} kcal
                </p>
              </div>
              <div className="bg-purple-50 p-3 rounded-md">
                <p className="text-xs text-purple-700 mb-1">Proteínas</p>
                <p className="text-lg font-medium">
                  {dietPlanDay.nutritionalSummary.protein || 0}g
                </p>
              </div>
              <div className="bg-green-50 p-3 rounded-md">
                <p className="text-xs text-green-700 mb-1">Carboidratos</p>
                <p className="text-lg font-medium">{dietPlanDay.nutritionalSummary.carbs || 0}g</p>
              </div>
              <div className="bg-yellow-50 p-3 rounded-md">
                <p className="text-xs text-yellow-700 mb-1">Gorduras</p>
                <p className="text-lg font-medium">{dietPlanDay.nutritionalSummary.fat || 0}g</p>
              </div>
            </div>

            {dietPlanDay.nutritionalSummary.notes && (
              <div className="mt-4 p-3 bg-gray-50 rounded-md">
                <p className="text-xs font-medium mb-1">Notas do Nutricionista:</p>
                <p className="text-sm">{dietPlanDay.nutritionalSummary.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
