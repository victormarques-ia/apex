'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, PlusIcon, TrashIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { createDietPlanAction, deleteDietPlanAction } from '@/app/(frontend)/nutrition/actions/diet-plans.action';
import { getMealsByDietPlanDayAction } from '@/app/(frontend)/nutrition/actions/meals.action';
import { CreateMealForm } from './create-meal-form';
import { MealCard } from './meal-card';

interface DietPlanFormProps {
  athleteId: string;
  nutritionistId: string;
  selectedDate: Date;
  dietPlan: any;
  dietPlanDay: any;
  isCreatingNewPlan: boolean;
  onDietPlanCreated: () => void;
  onDietPlanDayCreated: () => void;
  onDietPlanDayDeleted: () => void;
}

export function DietPlanForm({
  athleteId,
  nutritionistId,
  selectedDate,
  dietPlan,
  dietPlanDay,
  isCreatingNewPlan,
  onDietPlanCreated,
  onDietPlanDayCreated,
  onDietPlanDayDeleted
}: DietPlanFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [repeatInterval, setRepeatInterval] = useState(7);
  const [meals, setMeals] = useState([]);
  const [showCreateMeal, setShowCreateMeal] = useState(false);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date(new Date().setFullYear(new Date().getFullYear() + 1)));
  const [totalDailyCalories, setTotalDailyCalories] = useState<number>(0);
  const [notes, setNotes] = useState<string>("");

  // Format the date for display
  const formattedDate = selectedDate.toISOString().split('T')[0];

  // Initialize form with existing diet plan data if available
  useEffect(() => {
    if (dietPlan) {
      if (dietPlan.start_date) {
        setStartDate(new Date(dietPlan.start_date));
      }
      if (dietPlan.end_date) {
        setEndDate(new Date(dietPlan.end_date));
      }
      if (dietPlan.total_daily_calories) {
        setTotalDailyCalories(dietPlan.total_daily_calories);
      }
      if (dietPlan.notes) {
        setNotes(dietPlan.notes);
      }
    }
  }, [dietPlan]);

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

  // Create a new diet plan with diet plan day
  const handleCreateDietPlan = async () => {
    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('athleteId', athleteId);
      formData.append('startDate', startDate.toISOString().split('T')[0]);
      formData.append('endDate', endDate.toISOString().split('T')[0]);
      formData.append('totalDailyCalories', totalDailyCalories.toString());
      formData.append('notes', notes);
      formData.append('dayDate', selectedDate.toISOString().split('T')[0]);
      formData.append('repeatIntervalDays', repeatInterval.toString());

      const response = await createDietPlanAction(null, formData);

      console.log('Response createDietPlanAction: ', response);

      if (response.data) {
        if (onDietPlanCreated) {
          onDietPlanCreated();
        }
      } else {
        setError(response.message || 'Erro ao criar plano alimentar');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar plano alimentar';
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Delete a diet plan
  const handleDeleteDietPlan = async () => {
    if (!dietPlan || !dietPlan.id) {
      setError('Nenhum plano alimentar selecionado');
      return;
    }

    // if (!confirm('Tem certeza que deseja excluir este plano alimentar? Todas as refeições associadas serão excluídas.')) {
    //   return;
    // }

    try {
      console.log('Deleting diet plan with ID:', dietPlan);
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('dietPlanId', dietPlan.id);

      const response = await deleteDietPlanAction(null, formData);

      console.log('Response deleteDietPlanAction:', response);

      if (response.success) {
        if (onDietPlanDayDeleted) {
          onDietPlanDayDeleted();
        }
      } else {
        setError(response.message || 'Erro ao excluir plano alimentar');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir plano alimentar';
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderDietPlanForm = () => {
    if (isCreatingNewPlan) {
      return (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Criar Novo Plano Alimentar</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">Data de Início</Label>
              <div className="mb-4">
                <Calendar
                  selectedDate={startDate}
                  onDateChange={(date) => {
                    console.log("Setting start date:", date);
                    setStartDate(date);
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
                    console.log("Setting end date:", date);
                    if (date >= startDate) {
                      setEndDate(date);
                    } else {
                      alert("A data de término deve ser posterior à data de início");
                    }
                  }}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="total_daily_calories">Calorias Diárias</Label>
              <Input
                id="total_daily_calories"
                type="number"
                min="0"
                value={totalDailyCalories}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (!isNaN(value) && value >= 0) {
                    setTotalDailyCalories(value);
                  }
                }}
              />
            </div>
            <div>
              <Label htmlFor="repeat_interval">Repetir a cada (dias)</Label>
              <div className="flex items-center gap-2">
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

          <div>
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Adicione observações sobre o plano alimentar"
              className="min-h-[100px]"
            />
          </div>

          <div>
            <Label htmlFor="day_date">Data Inicial do Plano</Label>
            <Input id="day_date" value={formattedDate} disabled />
            <p className="text-xs text-muted-foreground mt-1">Este será o primeiro dia do plano alimentar</p>
          </div>

          <Button
            className="w-full"
            onClick={handleCreateDietPlan}
            disabled={loading}
          >
            Criar Plano Alimentar
          </Button>
        </div>
      );
    } else if (dietPlan && dietPlanDay) {
      // Render existing diet plan with meals
      return (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Plano Alimentar</h3>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteDietPlan}
              disabled={loading}
            >
              <TrashIcon className="h-4 w-4 mr-1" /> Excluir Plano
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">Data de Início</Label>
              <Input id="start_date" value={format(new Date(dietPlan.start_date), 'dd/MM/yyyy')} disabled />
            </div>
            <div>
              <Label htmlFor="end_date">Data de Término</Label>
              <Input id="end_date" value={format(new Date(dietPlan.end_date), 'dd/MM/yyyy')} disabled />
            </div>
            <div>
              <Label htmlFor="total_daily_calories">Calorias Diárias</Label>
              <Input id="total_daily_calories" value={dietPlan.total_daily_calories || 0} disabled />
            </div>
            <div>
              <Label htmlFor="repeat_interval">Repetir a cada (dias)</Label>
              <Input id="repeat_interval" value={dietPlanDay.repeat_interval_days || 0} disabled />
            </div>
          </div>

          {dietPlan.notes && (
            <div>
              <Label htmlFor="notes">Observações</Label>
              <Textarea id="notes" value={dietPlan.notes} disabled className="min-h-[80px]" />
            </div>
          )}

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
              date={selectedDate}
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
      );
    } else {
      // No plan selected and not creating a new one - show instructions
      return (
        <div className="space-y-4">
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
            <p className="text-gray-500 mb-2">Selecione um plano alimentar na lista acima ou crie um novo</p>
          </div>
        </div>
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuração do Plano Alimentar</CardTitle>
        <p className="text-sm text-muted-foreground">Data selecionada: {format(selectedDate, 'dd/MM/yyyy')}</p>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded mb-4">
            {error}
          </div>
        )}

        {renderDietPlanForm()}
      </CardContent>
    </Card>
  );
}
