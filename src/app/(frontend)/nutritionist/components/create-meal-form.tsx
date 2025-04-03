'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader } from 'lucide-react';
import { createMealAction } from '@/app/(frontend)/nutrition/actions/meal-plan.action';
import { getAthleteDietPlansAction } from '@/app/(frontend)/nutrition/actions/diet-plans.action';

interface CreateMealFormProps {
  athleteId: string;
  nutritionistId: string;
  date: string;
  intervalDays: int;
  dietPlanId: string;
  onMealCreated: () => void;
  onCancel: () => void;
}

export function CreateMealForm({ athleteId, nutritionistId, date, intervalDays, dietPlanId, onMealCreated, onCancel }: CreateMealFormProps) {
  const [mealType, setMealType] = useState('breakfast');
  const [scheduledTime, setScheduledTime] = useState('');
  const [orderIndex, setOrderIndex] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get current time formatted for input
  const getCurrentTime = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  };

  // Handle form submission
  const handleCreateMeal = async () => {
    try {
      setLoading(true);
      setError(null);

      // Create meal date-time from selected time or current time
      const mealDateTime = new Date();

      if (scheduledTime) {
        const [hours, minutes] = scheduledTime.split(':').map(Number);
        mealDateTime.setHours(hours, minutes, 0, 0);
      }

      const formData = new FormData();
      formData.append('dietPlanId', dietPlanId);
      formData.append('mealType', mealType);
      formData.append('scheduledTime', mealDateTime.toISOString());
      formData.append('orderIndex', orderIndex.toString());
      formData.append('date', date);

      const response = await createMealAction(null, formData);

      if (response.data) {
        if (onMealCreated) {
          onMealCreated();
        }
      } else {
        setError(response.message || 'Erro ao criar refeição');
      }
    } catch (err) {
      setError('Erro ao criar refeição');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Criar Nova Refeição</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Meal type selection */}
          <div>
            <Label htmlFor="meal-type">Tipo de Refeição</Label>
            <Select
              value={mealType}
              onValueChange={setMealType}
            >
              <SelectTrigger id="meal-type">
                <SelectValue placeholder="Selecione o tipo de refeição" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="breakfast">Café da manhã</SelectItem>
                <SelectItem value="morning_snack">Lanche da manhã</SelectItem>
                <SelectItem value="lunch">Almoço</SelectItem>
                <SelectItem value="afternoon_snack">Lanche da tarde</SelectItem>
                <SelectItem value="dinner">Jantar</SelectItem>
                <SelectItem value="supper">Ceia</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Scheduled time */}
          <div>
            <Label htmlFor="scheduled-time">Horário Previsto</Label>
            <Input
              id="scheduled-time"
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              placeholder={getCurrentTime()}
            />
            <p className="text-xs text-muted-foreground mt-1">Se não especificado, será usado o horário atual</p>
          </div>

          {/* Order index */}
          <div>
            <Label htmlFor="order-index">Ordem da Refeição</Label>
            <Input
              id="order-index"
              type="number"
              min="1"
              max="10"
              value={orderIndex}
              onChange={(e) => setOrderIndex(parseInt(e.target.value))}
            />
            <p className="text-xs text-muted-foreground mt-1">Número que indica a ordem da refeição no dia</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleCreateMeal}
          disabled={loading}
        >
          {loading ? (
            <Loader className="h-4 w-4 animate-spin mr-2" />
          ) : (
            'Criar Refeição'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
