'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { format, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { fetchFromApi } from '@/app/utils/fetch-from-api';

export function DietTabContent({ athleteId }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [meals, setMeals] = useState([]);
  const [dietDays, setDietDays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // buscar todos os planos alimentares para aquele atleta
        const dietPlansResponse = await fetchFromApi('/api/nutritionist/diet-plans?=${athleteId}');
        if (!dietPlansResponse.data)
          throw new Error('Esse atleta não possui nenhum plano alimentar');
        
        
        // 1. Buscar dias de plano de dieta
        const daysResponse = await fetch(`/api/diet-plan-days?athleteId=${athleteId}`);
        if (!daysResponse.ok) throw new Error('Failed to fetch diet days');
        const daysData = await daysResponse.json();
        setDietDays(daysData.docs || []);

        // 2. Buscar refeições
        const mealsResponse = await fetch(`/api/meals?athleteId=${athleteId}`);
        if (!mealsResponse.ok) throw new Error('Failed to fetch meals');
        const mealsData = await mealsResponse.json();
        setMeals(mealsData.docs || []);

      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (athleteId) fetchData();
  }, [athleteId]);

  const getMealsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    
    // Encontrar o dia correspondente
    const day = dietDays.find(d => {
      const dayDate = new Date(d.date).toISOString().split('T')[0];
      return dayDate === dateStr;
    });

    if (!day) return [];

    // Filtrar refeições para este dia
    return meals.filter(meal => {
      if (typeof meal.diet_plan_day === 'string') {
        return meal.diet_plan_day === day.id;
      }
      return meal.diet_plan_day?.id === day.id;
    });
  };

  const groupMealsByType = () => {
    const mealsForDate = getMealsForDate(selectedDate);
    const grouped = {};

    mealsForDate.forEach(meal => {
      if (!grouped[meal.meal_type]) {
        grouped[meal.meal_type] = [];
      }
      grouped[meal.meal_type].push(meal);
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

  if (loading) {
    return <div className="min-h-[600px] flex items-center justify-center">Carregando...</div>;
  }

  const groupedMeals = groupMealsByType();
  const datesWithMeals = dietDays.map(day => new Date(day.date));

  return (
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
                      <li key={meal.id} className="bg-gray-50 p-3 rounded-md">
                        <div className="flex justify-between items-start">
                          <span className="font-medium capitalize">
                            {meal.meal_type.replace('_', ' ')}
                          </span>
                          {meal.scheduled_time && (
                            <span className="text-xs text-muted-foreground">
                              {formatTime(meal.scheduled_time)}
                            </span>
                          )}
                        </div>
                        {meal.order_index && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Ordem: {meal.order_index}
                          </p>
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
  );
}