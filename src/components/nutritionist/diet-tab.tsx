'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { format, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { clientFetch } from '@/app/utils/client-fetch';
import { getMealHistoryAction } from '@/app/(frontend)/nutrition/actions/meals.action';

export function DietTabContent({ athleteId }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [meals, setMeals] = useState([]);
  const [mealsHistory, setMealsHistory] = useState(null);
  const [dietDays, setDietDays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch meals history directly - only API call needed
        const formData = new FormData();
        formData.append('athleteId', athleteId);
        
        const today = new Date();
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(today.getMonth() - 1);
        
        formData.append('from', oneMonthAgo.toISOString().split('T')[0]);
        formData.append('to', today.toISOString().split('T')[0]);
        
        const mealsResponse = await getMealHistoryAction(null, formData);
        
        console.log(mealsResponse);

        // Store the complete meal history response
        if (mealsResponse.data) {
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
  }, [athleteId]);

  const getMealsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    
    // Get all meals for this exact date from our original history response
    // This is safer than filtering the flattened meals array
    if (mealsHistory && mealsHistory.history && mealsHistory.history[dateStr]) {
      return mealsHistory.history[dateStr].meals || [];
    }
    
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

  if (loading) {
    return <div className="min-h-[600px] flex items-center justify-center">Carregando...</div>;
  }

  const groupedMeals = groupMealsByType();
  
  // Dates with meals come directly from the API's dateRange
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
  );
}
