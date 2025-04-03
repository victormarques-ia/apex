'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { updateDietPlanDayAction } from '@/app/(frontend)/nutrition/actions/diet-plans.action';
import { getMealsByDietPlanDayAction } from '@/app/(frontend)/nutrition/actions/meals.action';
import { CreateMealForm } from './create-meal-form';
import { MealCard } from './meal-card';
import { PlusIcon } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface DietPlanDayFormProps {
  athleteId: string;
  nutritionistId: string;
  dietPlanDay: any;
  onDietPlanDayUpdated: () => void;
}

export function DietPlanDayForm({
  athleteId,
  nutritionistId,
  dietPlanDay,
  onDietPlanDayUpdated
}: DietPlanDayFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [repeatInterval, setRepeatInterval] = useState<number>(7);
  const [date, setDate] = useState<Date>(new Date());
  const [meals, setMeals] = useState([]);
  const [showCreateMeal, setShowCreateMeal] = useState(false);
  
  // Initialize form with existing diet plan day data
  useEffect(() => {
    if (dietPlanDay) {
      if (dietPlanDay.date) {
        setDate(new Date(dietPlanDay.date));
      }
      if (dietPlanDay.repeat_interval_days !== undefined && dietPlanDay.repeat_interval_days !== null) {
        setRepeatInterval(dietPlanDay.repeat_interval_days);
      } else {
        setRepeatInterval(7); // valor padrão
      }
    }
  }, [dietPlanDay]);

  // Fetch meals when diet plan day changes
  useEffect(() => {
    if (dietPlanDay && dietPlanDay.id) {
      fetchMeals();
    } else {
      setMeals([]);
    }
  }, [dietPlanDay]);

  // Fetch meals for the current diet plan day
  const fetchMeals = async () => {
    if (!dietPlanDay || !dietPlanDay.id) return;

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('dietPlanDayId', dietPlanDay.id);

      const response = await getMealsByDietPlanDayAction(null, formData);

      if (response.data?.docs) {
        setMeals(response.data.docs || []);
      } else {
        setMeals([]);
      }
    } catch (err) {
      console.error('Error fetching meals:', err);
      setMeals([]);
    } finally {
      setLoading(false);
    }
  };

  // Refresh meals after changes
  const refreshMeals = () => {
    fetchMeals();
  };

  // Update diet plan day
  const handleUpdateDietPlanDay = async () => {
    if (!dietPlanDay || !dietPlanDay.id) {
      setError('Nenhum dia do plano alimentar selecionado');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const dayFormData = new FormData();
      dayFormData.append('dietPlanDayId', dietPlanDay.id);
      dayFormData.append('date', date.toISOString().split('T')[0]);
      dayFormData.append('repeatIntervalDays', repeatInterval.toString());
      
      // Obter o nome do dia da semana em português
      const dayOfWeek = new Date(date).toLocaleDateString('pt-BR', { weekday: 'long' });
      dayFormData.append('dayOfWeek', dayOfWeek);

      const dayResponse = await updateDietPlanDayAction(null, dayFormData);

      if (dayResponse.data.success) {
        if (onDietPlanDayUpdated) {
          onDietPlanDayUpdated();
        }
        alert('Dia do plano alimentar atualizado com sucesso!');
      } else {
        setError(dayResponse.message || 'Erro ao atualizar dia do plano alimentar');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar dia do plano alimentar';
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Editar Dia do Plano Alimentar</CardTitle>
        <p className="text-sm text-muted-foreground">ID: {dietPlanDay?.id}</p>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date">Data do Plano Diário</Label>
              <div className="mb-4">
                <Calendar
                  selectedDate={date}
                  onDateChange={(newDate) => {
                    setDate(newDate);
                  }}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="repeat_interval">Repetir a cada (dias)</Label>
              <div className="flex items-center gap-2 mt-2">
                <Input
                  id="repeat_interval"
                  type="number"
                  min="0"
                  max="30"
                  value={repeatInterval}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value) && value >= 0 && value <= 30) {
                      setRepeatInterval(value);
                    }
                  }}
                />
                <span className="text-sm text-muted-foreground">dias</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">0 = não repetir, 1-30 = intervalo de repetição</p>
            </div>
          </div>

          <Button
            className="w-full mt-4"
            onClick={handleUpdateDietPlanDay}
            disabled={loading}
          >
            Salvar Alterações
          </Button>

          <Separator className="my-4" />

          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Refeições</h3>
            <Button
              onClick={() => setShowCreateMeal(true)}
              size="sm"
              disabled={loading}
            >
              <PlusIcon className="h-4 w-4 mr-1" /> Nova Refeição
            </Button>
          </div>

          {showCreateMeal ? (
            <CreateMealForm
              athleteId={athleteId}
              nutritionistId={nutritionistId}
              date={date}
              intervalDays={dietPlanDay.repeat_interval_days || 0}
              dietPlanDayId={dietPlanDay.id}
              onMealCreated={() => {
                setShowCreateMeal(false);
                refreshMeals();
              }}
              onCancel={() => setShowCreateMeal(false)}
            />
          ) : (
            <>
              {meals.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                  <p className="text-gray-500 mb-2">Nenhuma refeição registrada</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCreateMeal(true)}
                  >
                    <PlusIcon className="h-4 w-4 mr-1" /> Adicionar Refeição
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {meals.map(meal => (
                    <MealCard
                      key={meal.id}
                      meal={meal}
                      onMealUpdated={refreshMeals}
                      onMealDeleted={refreshMeals}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
