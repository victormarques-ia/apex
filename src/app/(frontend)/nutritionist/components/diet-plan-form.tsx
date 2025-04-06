'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { createDietPlanAction, updateDietPlanAction } from '@/app/(frontend)/nutrition/actions/diet-plans.action';

interface DietPlanFormProps {
  athleteId: string;
  nutritionistId: string;
  selectedDate: Date;
  dietPlan: any;
  isCreatingNewPlan: boolean;
  onDietPlanCreated: () => void;
  onDietPlanUpdated?: () => void;
  onBackToCalendar?: () => void;
}

export function DietPlanForm({
  athleteId,
  nutritionistId,
  selectedDate,
  dietPlan,
  isCreatingNewPlan,
  onDietPlanCreated,
  onDietPlanUpdated = () => { },
  onBackToCalendar
}: DietPlanFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [repeatInterval, setRepeatInterval] = useState<number>(7);
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

  // Update an existing diet plan
  const handleUpdateDietPlan = async () => {
    if (!dietPlan || !dietPlan.id) {
      setError('Nenhum plano alimentar selecionado');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Atualizar o plano alimentar
      const planFormData = new FormData();
      planFormData.append('dietPlanId', dietPlan.id);
      planFormData.append('startDate', startDate.toISOString().split('T')[0]);
      planFormData.append('endDate', endDate.toISOString().split('T')[0]);
      planFormData.append('totalDailyCalories', totalDailyCalories.toString());
      planFormData.append('notes', notes);

      const planResponse = await updateDietPlanAction(null, planFormData);

      console.log('====================');
      console.log('Response updateDietPlanAction:', planResponse);
      console.log('====================');

      if (planResponse.data.success) {
        if (onDietPlanUpdated) {
          onDietPlanUpdated();
        }
        alert('Plano alimentar atualizado com sucesso!');
      } else {
        setError(planResponse.message || 'Erro ao atualizar plano alimentar');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar plano alimentar';
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

          <Button
            className="w-full"
            onClick={handleCreateDietPlan}
            disabled={loading}
          >
            Criar Plano Alimentar
          </Button>
        </div>
      );
    } else if (dietPlan) {
      // Render existing diet plan
      return (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Editar Plano Alimentar</h3>
          </div>

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
          </div>

          <div>
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Adicione observações sobre o plano alimentar"
              className="min-h-[80px]"
            />
          </div>

          <div className="flex gap-2 mt-4">
            <Button
              className="w-full"
              onClick={handleUpdateDietPlan}
              disabled={loading}
            >
              Salvar Alterações
            </Button>
          </div>
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
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            {onBackToCalendar && (
              <Button
                size="sm"
                variant="ghost"
                onClick={onBackToCalendar}
                className="mr-2"
              >
                ← Voltar
              </Button>
            )}
            <div>
              <CardTitle>Configuração do Plano Alimentar</CardTitle>
            </div>
          </div>
        </div>
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
