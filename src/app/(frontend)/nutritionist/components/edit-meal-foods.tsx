'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader, Trash2Icon } from 'lucide-react';
import { removeFoodFromMealAction } from '@/app/(frontend)/nutrition/actions/meal-plan.action';
import { AddFoodToMeal } from './add-food-to-meal';

interface EditMealFoodsProps {
  mealId: string;
  mealFoods: any[];
  onFoodsUpdated: () => void;
  onCancel: () => void;
}

export function EditMealFoods({ mealId, mealFoods, onFoodsUpdated, onCancel }: EditMealFoodsProps) {
  const [foods, setFoods] = useState(mealFoods || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddFood, setShowAddFood] = useState(false);

  // Remove a food from the meal
  const handleRemoveFood = async (mealFoodId: string) => {
    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('mealFoodId', mealFoodId);

      const response = await removeFoodFromMealAction(null, formData);

      if (response.success) {
        // Remove the food from local state
        setFoods(foods.filter(food => food.id !== mealFoodId));
        
        // Notify parent of update
        onFoodsUpdated();
      } else {
        setError(response.message || 'Erro ao remover alimento');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao remover alimento';
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Gerenciar Alimentos da Refeição</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded mb-4">
            {error}
          </div>
        )}

        {showAddFood ? (
          <AddFoodToMeal 
            mealId={mealId}
            onFoodAdded={() => {
              setShowAddFood(false);
              onFoodsUpdated();
            }}
            onCancel={() => setShowAddFood(false)}
          />
        ) : (
          <>
            {foods.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500 mb-4">Nenhum alimento adicionado</p>
                <Button onClick={() => setShowAddFood(true)}>
                  Adicionar Alimento
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <Button 
                    size="sm" 
                    onClick={() => setShowAddFood(true)}
                  >
                    Adicionar Alimento
                  </Button>
                </div>
                
                <ul className="divide-y">
                  {foods.map(food => (
                    <li key={food.id} className="py-3 flex justify-between items-center">
                      <div className="flex-1">
                        <p className="font-medium">{food.food.name}</p>
                        <p className="text-sm text-gray-600">
                          {food.quantity_grams}g - {food.food.calories_per_100g * food.quantity_grams / 100} kcal
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:bg-red-50 hover:text-red-800"
                        onClick={() => handleRemoveFood(food.id)}
                        disabled={loading}
                      >
                        {loading ? <Loader className="h-4 w-4 animate-spin" /> : <Trash2Icon className="h-4 w-4" />}
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button variant="outline" onClick={onCancel}>
          Concluído
        </Button>
      </CardFooter>
    </Card>
  );
}
