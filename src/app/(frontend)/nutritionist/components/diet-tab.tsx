'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { format, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { getMealHistoryAction } from '@/app/(frontend)/nutrition/actions/meals.action';
import { getAthleteDietPlansAction, getDietPlanAction } from '@/app/(frontend)/nutrition/actions/diet-plans.action';
import { DietPlanForm } from './diet-plan-form';
import { DietPlansList } from './diet-plans-list';
import { RESPONSE_LIMIT_DEFAULT } from 'next/dist/server/api-utils';

interface DietTabContentProps {
  athleteId: string;
  nutritionistId: string;
}

export function DietTabContent({ athleteId, nutritionistId }: DietTabContentProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [meals, setMeals] = useState([]);
  const [mealsHistory, setMealsHistory] = useState(null);
  const [dietDays, setDietDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dietPlan, setDietPlan] = useState(null);
  const [dietPlanDay, setDietPlanDay] = useState(null);
  const [showDietPlanForm, setShowDietPlanForm] = useState(false);
  const [isCreatingNewPlan, setIsCreatingNewPlan] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1. Fetch diet plans and diet plan days with the new one-to-one relationship
        console.log('Athlete ID: ', athleteId);
        if (athleteId) {
          const dateStr = selectedDate.toISOString().split('T')[0];

          const formData = new FormData();
          formData.append('athleteId', athleteId);
          formData.append('date', dateStr);

          const response = await getAthleteDietPlansAction(null, formData);

          console.log('Response: ', response);

          
          if (response.data && response.data?.totalDocs > 0) {
            // Set diet plan day
            setDietPlanDay(response.data.docs[0]);
            // Get the associated diet plan
            setDietPlan(response.data.docs[0].diet_plan);
          } else {
            setDietPlanDay(null);
            setDietPlan(null);
          }
        }

        // 2. Fetch meals history - use exact dates to match what we're displaying
        const formData = new FormData();
        formData.append('athleteId', athleteId);

        const dateStr = selectedDate.toISOString().split('T')[0];
        // Use the exact selected date instead of a date range
        formData.append('from', dateStr);
        formData.append('to', dateStr);

        console.log(`Fetching meals for athleteId=${athleteId}, date=${dateStr}`);
        const mealsResponse = await getMealHistoryAction(null, formData);
        // console.log('Meals response:', mealsResponse);

        if (mealsResponse.data?.dateRange) {
          setMealsHistory(mealsResponse.data);

          // Extract all unique meals for any other operations that need the flat list
          if (mealsResponse.data.history) {
            const allMeals = Object.values(mealsResponse.data.history)
              .flatMap(dayData => dayData.meals || []);

            // Get unique meals by ID to avoid duplicates in the flat list
            const uniqueMeals = [];
            const mealIds = new Set();

            allMeals.forEach(meal => {
              if (!mealIds.has(meal.id)) {
                mealIds.add(meal.id);
                uniqueMeals.push(meal);
              }
            });

            setMeals(uniqueMeals);
          } else {
            setMeals([]);
          }

          // Extract dates that have meals directly from the response
          if (mealsResponse.data.dateRange) {
            setDietDays(mealsResponse.data.dateRange.map(dateStr => ({
              date: dateStr
            })));
          } else {
            setDietDays([]);
          }
        } else {
          setMealsHistory(null);
          setMeals([]);
          setDietDays([]);
        }

      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (athleteId) fetchData();
  }, [athleteId, selectedDate]);

  // Function to refresh data after diet plan actions
  const refreshData = async () => {
    try {
      setLoading(true);

      // Get diet plan day for selected date using the new action
      if (athleteId) {
        const dateStr = selectedDate.toISOString().split('T')[0];

        const formData = new FormData();
        formData.append('athleteId', athleteId);
        formData.append('date', dateStr);

        const response = await getAthleteDietPlansAction(null, formData);

        if (response.success && response.data && response.data.docs && response.data.docs.length > 0) {
          setDietPlanDay(response.data.docs[0]);
          setDietPlan(response.data.docs[0].diet_plan);
        } else {
          setDietPlanDay(null);
          setDietPlan(null);
        }
      }

      // Fetch meals again - use exact date
      const formData = new FormData();
      formData.append('athleteId', athleteId);

      const dateStr = selectedDate.toISOString().split('T')[0];
      formData.append('from', dateStr);
      formData.append('to', dateStr);

      const mealsResponse = await getMealHistoryAction(null, formData);

      if (mealsResponse.success && mealsResponse.data) {
        setMealsHistory(mealsResponse.data);

        if (mealsResponse.data.history) {
          const allMeals = Object.values(mealsResponse.data.history)
            .flatMap(dayData => dayData.meals || []);

          const uniqueMeals = [];
          const mealIds = new Set();

          allMeals.forEach(meal => {
            if (!mealIds.has(meal.id)) {
              mealIds.add(meal.id);
              uniqueMeals.push(meal);
            }
          });

          setMeals(uniqueMeals);
        }

        if (mealsResponse.data.dateRange) {
          setDietDays(mealsResponse.data.dateRange.map(dateStr => ({
            date: dateStr
          })));
        }
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMealsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];

    // console.log('Looking for meals on date:', dateStr);
    // console.log('mealsHistory:', mealsHistory);

    // Get all meals for this exact date from our original history response
    if (mealsHistory && mealsHistory.history && mealsHistory.history[dateStr]) {
      // console.log('Found meals for date:', mealsHistory.history[dateStr].meals);
      return mealsHistory.history[dateStr].meals || [];
    }

    console.log('No meals found for date:', dateStr);
    return [];
  };

  const groupMealsByType = () => {
    const mealsForDate = getMealsForDate(selectedDate);
    const grouped = {};

    mealsForDate.forEach(meal => {
      // Use mealType instead of meal_type
      if (!grouped[meal.mealType]) {
        grouped[meal.mealType] = [];
      }
      grouped[meal.mealType].push(meal);
    });

    return grouped;
  };

  const translateMealType = (type) => {
    const types = {
      'breakfast': 'Café da manhã',
      'morning_snack': 'Lanche da manhã',
      'lunch': 'Almoço',
      'afternoon_snack': 'Lanche da tarde',
      'dinner': 'Jantar',
      'supper': 'Ceia'
    };
    return types[type] || type;
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    try {
      const date = new Date(timeString);
      return format(date, 'HH:mm');
    } catch {
      return '';
    }
  };

  const handleDietPlanCreated = () => {
    refreshData();
    setShowDietPlanForm(false);
    setIsCreatingNewPlan(false);
  };

  const handleDietPlanDayCreated = () => {
    refreshData();
  };

  const handleDietPlanDayDeleted = () => {
    refreshData();
    setDietPlanDay(null);
    setDietPlan(null);
    setSelectedPlanId(null);
  };

  const handleDietPlanUpdated = () => {
    refreshData();
  };

  const handleSelectPlan = (plan) => {
    console.log('Plan selected:', plan);
    setDietPlan(plan);
    setSelectedPlanId(plan.id);

    // Find the diet plan day for this plan and selected date
    const formData = new FormData();
    formData.append('dietPlanId', plan.id);

    getDietPlanAction(null, formData).then(response => {
      console.log('Response getDietPlanAction:', response);
      if (response.data.data) {
        setDietPlanDay(response.data.data.dietPlanDay);
        setShowDietPlanForm(true);
        setIsCreatingNewPlan(false);
      } else {
        console.error('Failed to get diet plan details:', response);
        // Handle error - still show the form but without day data
        setDietPlanDay(null);
        setShowDietPlanForm(true);
        setIsCreatingNewPlan(false);
      }
    }).catch(err => {
      console.error('Error getting diet plan details:', err);
      setDietPlanDay(null);
      setShowDietPlanForm(true);
      setIsCreatingNewPlan(false);
    });
  };

  const handleAddNewPlan = () => {
    setDietPlan(null);
    setDietPlanDay(null);
    setSelectedPlanId(null);
    setIsCreatingNewPlan(true);
    setShowDietPlanForm(true);
  };

  if (loading) {
    return <div className="min-h-[600px] flex items-center justify-center">Carregando...</div>;
  }

  const groupedMeals = groupMealsByType();

  // Dates with meals come directly from the API's dateRange
  const datesWithMeals = dietDays.map(day => new Date(day.date));

  return (
    <div className="space-y-6">
      {/* List of diet plans */}
      {athleteId && (
        <DietPlansList
          athleteId={athleteId}
          onSelectPlan={handleSelectPlan}
          onAddNewPlan={handleAddNewPlan}
          onPlanDeleted={handleDietPlanDayDeleted}
          selectedPlanId={selectedPlanId}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendário */}
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
                  hasMeals: (date) => datesWithMeals.some(d => isSameDay(d, date)),
                }}
                modifiersStyles={{
                  hasMeals: {
                    border: '2px solid #10B981',
                  },
                }}
              />
            </CardContent>
            <CardFooter>
              {isCreatingNewPlan ? (
                <Button
                  className="w-full"
                  onClick={() => {
                    setShowDietPlanForm(false);
                    setIsCreatingNewPlan(false);
                  }}
                >
                  Cancelar
                </Button>
              ) : selectedPlanId ? (
                <Button
                  className="w-full"
                  onClick={() => setShowDietPlanForm(!showDietPlanForm)}
                >
                  {showDietPlanForm ? "Esconder Formulário" : "Editar Plano"}
                </Button>
              ) : (
                <Button
                  className="w-full"
                  onClick={handleAddNewPlan}
                >
                  Adicionar Plano
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>

        {/* Detalhes das Refeições */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">
                {format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.keys(groupedMeals).length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma refeição registrada</p>
              ) : (
                Object.entries(groupedMeals).map(([mealType, meals]) => (
                  <div key={mealType}>
                    <h3 className="font-medium mb-2">{translateMealType(mealType)}</h3>
                    <ul className="space-y-2">
                      {meals.map(meal => (
                        <li
                          key={meal.id}
                          className={`${meal.isRepeated ? 'bg-gray-50' : 'bg-blue-50'} p-3 rounded-md`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-medium capitalize">
                                {meal.mealType.replace('_', ' ')}
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

                          <div className="flex flex-wrap gap-2 mt-1 text-xs text-muted-foreground">
                            {meal.orderIndex && (
                              <span>Ordem: {meal.orderIndex}</span>
                            )}
                            {meal.isRepeated && meal.originalDate && (
                              <span>Original: {new Date(meal.originalDate).toLocaleDateString()}</span>
                            )}
                          </div>

                          {/* Add food items information */}
                          {meal.foods && meal.foods.length > 0 && (
                            <div className="mt-2 text-sm">
                              <p className="text-xs font-medium mb-1">Alimentos:</p>
                              <ul className="space-y-1 pl-2">
                                {meal.foods.map(foodItem => (
                                  <li key={foodItem.id} className="flex justify-between">
                                    <span>{foodItem.food.name}</span>
                                    <span className="text-muted-foreground">{foodItem.quantity}g</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Diet Plan Form */}
      {showDietPlanForm && (
        <DietPlanForm
          athleteId={athleteId}
          nutritionistId={nutritionistId}
          selectedDate={selectedDate}
          dietDays={dietDays}
          dietPlan={dietPlan}
          dietPlanDay={dietPlanDay}
          isCreatingNewPlan={isCreatingNewPlan}
          onDietPlanCreated={handleDietPlanCreated}
          onDietPlanDayCreated={handleDietPlanDayCreated}
          onDietPlanDayDeleted={handleDietPlanDayDeleted}
          onDietPlanUpdated={handleDietPlanUpdated}
        />
      )}
    </div>
  );
}
