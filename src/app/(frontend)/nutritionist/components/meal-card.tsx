'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Clock, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { AddFoodToMeal } from './add-food-to-meal';
import { removeFoodFromMealAction, deleteMealAction } from '@/app/(frontend)/nutrition/actions/meal-plan.action';

interface MealCardProps {
  meal: any;
  onMealUpdated: () => void;
  onMealDeleted: () => void;
}

export function MealCard({ meal, onMealUpdated, onMealDeleted }: MealCardProps) {
  const [showAddFood, setShowAddFood] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle food removal
  const handleRemoveFood = async (mealFoodId) => {
    try {
      setLoading(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('mealFoodId', mealFoodId);
      
      const response = await removeFoodFromMealAction(null, formData);
      
      if (response.success) {
        if (onMealUpdated) {
          onMealUpdated();
        }
      } else {
        setError(response.message || 'Erro ao remover alimento');
      }
    } catch (err) {
      setError('Erro ao remover alimento');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle meal deletion
  const handleDeleteMeal = async () => {
    if (!window.confirm('Tem certeza que deseja excluir esta refeição?')) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('mealId', meal.id);
      
      const response = await deleteMealAction(null, formData);
      
      if (response.success) {
        if (onMealDeleted) {
          onMealDeleted();
        }
      } else {
        setError(response.message || 'Erro ao excluir refeição');
      }
    } catch (err) {
      setError('Erro ao excluir refeição');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Translate meal type to Portuguese
  const translateMealType = (type) => {
    const types = {
      'breakfast': 'Café da manhã',
      'morning_snack': 'Lanche da manhã',
      'lunch': 'Almoço',
      'afternoon_snack': 'Lanche da tarde',
      'dinner': 'Jantar',
      'supper': 'Ceia',
      'past-training': 'Pré-treino',
      'post-training': 'Pós-treino' 
    };
    return types[type] || type;
  };

  // If adding food, show the add food form
  if (showAddFood) {
    return (
      <AddFoodToMeal
        mealId={meal.id}
        onFoodAdded={() => {
          setShowAddFood(false);
          if (onMealUpdated) {
            onMealUpdated();
          }
        }}
        onCancel={() => setShowAddFood(false)}
      />
    );
  }

  // Calculate nutritional totals
  const calculateNutrients = () => {
    if (!meal.foods || meal.foods.length === 0) {
      return { calories: 0, protein: 0, carbs: 0, fat: 0 };
    }
    
    return meal.foods.reduce((acc, foodItem) => {
      const food = foodItem.food;
      const factor = foodItem.quantity / 100;
      
      acc.calories += (food.calories_per_100g || 0) * factor;
      acc.protein += (food.protein_per_100g || 0) * factor;
      acc.carbs += (food.carbs_per_100g || 0) * factor;
      acc.fat += (food.fat_per_100g || 0) * factor;
      
      return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  const nutrients = calculateNutrients();

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-slate-50">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold">
            {translateMealType(meal.meal_type || meal.mealType)}
          </CardTitle>
          <div className="flex items-center space-x-2">
            {meal.scheduledTime && (
              <div className="flex items-center text-gray-500 text-sm">
                <Clock className="h-3 w-3 mr-1" />
                {format(new Date(meal.scheduledTime), 'HH:mm')}
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
              onClick={handleDeleteMeal}
              disabled={loading}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {error && (
          <div className="bg-red-50 text-red-500 p-2 rounded mb-4 text-sm">
            {error}
          </div>
        )}
        
        {/* Nutritional summary */}
        <div className="grid grid-cols-4 gap-2 mb-4 text-center">
          <div className="bg-blue-50 p-2 rounded">
            <div className="text-xs text-blue-600">Calorias</div>
            <div className="font-medium">{Math.round(nutrients.calories)} kcal</div>
          </div>
          <div className="bg-red-50 p-2 rounded">
            <div className="text-xs text-red-600">Proteínas</div>
            <div className="font-medium">{Math.round(nutrients.protein)}g</div>
          </div>
          <div className="bg-amber-50 p-2 rounded">
            <div className="text-xs text-amber-600">Carboidratos</div>
            <div className="font-medium">{Math.round(nutrients.carbs)}g</div>
          </div>
          <div className="bg-green-50 p-2 rounded">
            <div className="text-xs text-green-600">Gorduras</div>
            <div className="font-medium">{Math.round(nutrients.fat)}g</div>
          </div>
        </div>
        
        {/* Food items */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium mb-2">Alimentos:</h4>
          
          {(!meal.foods || meal.foods.length === 0) ? (
            <p className="text-sm text-gray-500 italic">Nenhum alimento adicionado</p>
          ) : (
            <ul className="space-y-2">
              {meal.foods.map((foodItem) => (
                <li key={foodItem.id} className="flex justify-between items-center p-2 border rounded">
                  <div>
                    <p className="font-medium">{foodItem.food.name}</p>
                    <p className="text-xs text-gray-500">
                      {foodItem.quantity}g • {Math.round((foodItem.food.calories_per_100g || 0) * foodItem.quantity / 100)} kcal
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                    onClick={() => handleRemoveFood(foodItem.id)}
                    disabled={loading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 border-t">
        <Button 
          variant="outline" 
          size="sm"
          className="w-full"
          onClick={() => setShowAddFood(true)}
        >
          <Plus className="h-4 w-4 mr-2" /> Adicionar Alimento
        </Button>
      </CardFooter>
    </Card>
  );
}
