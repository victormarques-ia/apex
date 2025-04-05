'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { format, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { PlusIcon, Trash2Icon, Edit2Icon } from 'lucide-react';
import { getMealHistoryAction } from '@/app/(frontend)/nutrition/actions/meals.action';
import { deleteMealAction } from '@/app/(frontend)/nutrition/actions/meal-plan.action';
import { getAthleteDietPlansAction, getDietPlanAction } from '@/app/(frontend)/nutrition/actions/diet-plans.action';
import { DietPlanForm } from './diet-plan-form';
import { DietPlanDayForm } from './diet-plan-day-form';
import { DietPlansList } from './diet-plans-list';
import { CreateMealForm } from './create-meal-form';
import { AddFoodToMeal } from './add-food-to-meal';
import { EditMealFoods } from './edit-meal-foods';

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
  const [showDietPlanDayForm, setShowDietPlanDayForm] = useState(false);
  const [isCreatingNewPlan, setIsCreatingNewPlan] = useState(false);
  const [showAddFoodForm, setShowAddFoodForm] = useState(false);
  const [showEditFoodsForm, setShowEditFoodsForm] = useState(false);
  const [selectedMealId, setSelectedMealId] = useState(null);
  const [deletingMeal, setDeletingMeal] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [selectedPlanDayId, setSelectedPlanDayId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

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
        console.log('Meals response:', mealsResponse);

        if (mealsResponse.data?.dateRange) {
          setMealsHistory(mealsResponse.data);

          // Extract all unique meals for the selected date
          const dateStr = selectedDate.toISOString().split('T')[0];
          if (mealsResponse.data.history && mealsResponse.data.history[dateStr]) {
            setMeals(mealsResponse.data.history[dateStr].meals || []);
          } else {
            setMeals([]);
          }

          // Set dates with meals for calendar highlighting
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
      console.log('Meal response:', mealsResponse)

      if (mealsResponse.data) {
        setMealsHistory(mealsResponse.data);

        // Extract meals for the selected date
        const dateStr = selectedDate.toISOString().split('T')[0];
        if (mealsResponse.data.history && mealsResponse.data.history[dateStr]) {
          setMeals(mealsResponse.data.history[dateStr].meals || []);
        } else {
          setMeals([]);
        }

        // Set dates with meals for calendar highlighting
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

  // Sort meals by order_index for display
  const getSortedMeals = () => {
    if (!meals || meals.length === 0) return [];
    return [...meals].sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
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
  };

  const handleDietPlanUpdated = () => {
    refreshData();
  };

  const handleSelectPlan = (plan) => {
    console.log('Plan selected:', plan);
    setDietPlan(plan);
    setSelectedPlanId(plan.id);

    // Mostrar formulário do plano alimentar
    setShowDietPlanForm(false);
    setShowDietPlanDayForm(false);
    setIsCreatingNewPlan(false);
  };

  const handleEditPlan = (plan: any) => {
    setDietPlan(plan);
    setSelectedPlanId(null);

    // Mostrar formulário do plano alimentar
    setShowDietPlanForm(true);
    setShowDietPlanDayForm(false);
    setIsCreatingNewPlan(false);
  };

  const handleSelectPlanDays = (plan: any) => {
    setDietPlanDay(plan);
    setSelectedPlanDayId(plan.id);
    console.log('Diet Plan Day selected:', plan);

    // Mostrar formulário do dia do plano alimentar
    setShowDietPlanDayForm(true);
    setShowDietPlanForm(false);
    setIsCreatingNewPlan(false);
  };

  const handleAddNewPlan = () => {
    setDietPlan(null);
    setDietPlanDay(null);
    setSelectedPlanId(null);
    setSelectedPlanDayId(null);
    setIsCreatingNewPlan(true);
    setShowDietPlanForm(true);
    setShowDietPlanDayForm(false);
  };

  if (loading) {
    return <div className="min-h-[600px] flex items-center justify-center">Carregando...</div>;
  }

  // Dates with meals come directly from the API's dateRange
  const datesWithMeals = dietDays.map(day => new Date(day.date));

  return (
    <div className="space-y-6">
      {/* List of diet plans */}
      {athleteId && (
        <DietPlansList
          athleteId={athleteId}
          onSelectPlan={handleSelectPlan}
          onSelectPlanDays={handleSelectPlanDays}
          onEditPlan={handleEditPlan}
          onAddNewPlan={handleAddNewPlan}
          onPlanDeleted={handleDietPlanDayDeleted}
          onPlanDayDeleted={handleDietPlanDayDeleted}

          selectedPlanId={selectedPlanId}
          selectedPlanDayId={selectedPlanDayId}
        />
      )}
      {(!showDietPlanForm && showDietPlanDayForm && selectedPlanId) && (
        <CreateMealForm
          athleteId={athleteId}
          nutritionistId={nutritionistId}
          date={selectedDate.toISOString().split('T')[0]}
          intervalDays={0}
          dietPlanId={selectedPlanId}
          onMealCreated={handleDietPlanUpdated}
          onCancel={() => setShowDietPlanDayForm(false)}
        />
      )}
      {(showDietPlanForm && !showDietPlanDayForm) ? (
        <DietPlanForm
          athleteId={athleteId}
          nutritionistId={nutritionistId}
          selectedDate={selectedDate}
          dietPlan={dietPlan}
          isCreatingNewPlan={isCreatingNewPlan}
          onDietPlanCreated={handleDietPlanCreated}
          onDietPlanUpdated={handleDietPlanUpdated}
          onBackToCalendar={() => setShowDietPlanForm(false)}
        />
      ) : (
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
                      setShowDietPlanDayForm(false);
                      setIsCreatingNewPlan(false);
                    }}
                  >
                    Cancelar
                  </Button>
                ) : selectedPlanId ? (
                  <Button
                    className="w-full"
                    onClick={() => {
                      setShowDietPlanDayForm(true);
                      setShowDietPlanForm(false);
                      setIsCreatingNewPlan(false);
                    }}
                  >
                    {"Adicionar Refeição"}
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
                {meals.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhuma refeição registrada</p>
                ) : (
                  <ul className="space-y-2">
                    {getSortedMeals().map(meal => (
                      <li key={meal.id} className="bg-blue-50 p-3 rounded-md">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-medium capitalize">
                              {translateMealType(meal.meal_type)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 rounded-full bg-white hover:bg-gray-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedMealId(meal.id);
                                setShowAddFoodForm(true);
                              }}
                              title="Adicionar alimento"
                            >
                              <PlusIcon className="h-3 w-3" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 rounded-full bg-white hover:bg-gray-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedMealId(meal.id);
                                setShowEditFoodsForm(true);
                              }}
                              title="Editar alimentos"
                            >
                              <Edit2Icon className="h-3 w-3" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 rounded-full bg-white hover:bg-gray-100 hover:text-red-600"
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (confirm('Tem certeza que deseja excluir esta refeição?')) {
                                  setDeletingMeal(true);
                                  try {
                                    const formData = new FormData();
                                    formData.append('mealId', meal.id);
                                    await deleteMealAction(null, formData);
                                    refreshData();
                                  } catch (error) {
                                    console.error('Error deleting meal:', error);
                                    alert('Erro ao excluir refeição');
                                  } finally {
                                    setDeletingMeal(false);
                                  }
                                }
                              }}
                              disabled={deletingMeal}
                              title="Excluir refeição"
                            >
                              <Trash2Icon className="h-3 w-3" />
                            </Button>

                            {meal.scheduled_time && (
                              <span className="text-xs text-muted-foreground ml-1">
                                {formatTime(meal.scheduled_time)}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mt-1 text-xs text-muted-foreground">
                          {meal.foods && meal.foods.length > 0 ?
                            <span>
                              {meal.foods.map(food => String(food.quantity_grams) + 'g de ' + food.food.name).join(', ')}
                            </span>
                            :
                            <span className="italic text-gray-400">Nenhum alimento cadastrado</span>
                          }
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Add Food Form */}
      {showAddFoodForm && selectedMealId && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="max-w-md w-full">
            <AddFoodToMeal
              mealId={selectedMealId}
              onFoodAdded={() => {
                setShowAddFoodForm(false);
                refreshData();
              }}
              onCancel={() => setShowAddFoodForm(false)}
            />
          </div>
        </div>
      )}

      {/* Edit Foods Form */}
      {showEditFoodsForm && selectedMealId && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="max-w-xl w-full">
            <EditMealFoods
              mealId={selectedMealId}
              foods={meals.find(meal => meal.id === selectedMealId)?.foods || []}
              onFoodsUpdated={() => {
                refreshData();
              }}
              onCancel={() => setShowEditFoodsForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
