'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader, Trash2Icon, Save } from 'lucide-react';
import { removeFoodFromMealAction, updateMealFoodAction } from '@/app/(frontend)/nutrition/actions/meal-plan.action';
import { AddFoodToMeal } from './add-food-to-meal';

interface EditMealFoodsProps {
  mealId: string;
  foods: any[];
  onFoodsUpdated: () => void;
  onCancel: () => void;
}

export function EditMealFoods({ mealId, foods, onFoodsUpdated, onCancel }: EditMealFoodsProps) {
  const [foodItems, setFoodItems] = useState(foods || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddFood, setShowAddFood] = useState(false);
  const [editingFoodId, setEditingFoodId] = useState<string | null>(null);
  const [newQuantity, setNewQuantity] = useState<number>(0);

  // Start editing a food quantity
  const startEditingQuantity = (foodItem: any) => {
    setEditingFoodId(foodItem.id);
    setNewQuantity(foodItem.quantity_grams);
  };

  // Cancel editing a food quantity
  const cancelEditingQuantity = () => {
    setEditingFoodId(null);
    setNewQuantity(0);
  };

  // Update a food quantity
  const handleUpdateQuantity = async (mealFoodId: string) => {
    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('mealFoodId', mealFoodId);
      formData.append('quantity', newQuantity.toString());

      const response = await updateMealFoodAction(null, formData);

      if (response.success) {
        // Update the food in local state
        setFoodItems(
          foodItems.map(food => 
            food.id === mealFoodId 
            ? { ...food, quantity_grams: newQuantity } 
            : food
          )
        );
        
        // Reset editing state
        setEditingFoodId(null);
        
        // Notify parent of update
        onFoodsUpdated();
      } else {
        setError(response.message || 'Erro ao atualizar quantidade');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar quantidade';
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Remove a food from the meal
  const handleRemoveFood = async (mealFoodId: string) => {
    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('mealFoodId', mealFoodId);

      const response = await removeFoodFromMealAction(null, formData);

      if (response.data) {
        // Remove the food from local state
        setFoodItems(foodItems.filter(food => food.id !== mealFoodId));

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
            {foodItems.length === 0 ? (
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
                  {foodItems.map(food => (
                    <li key={food.id} className="py-3 flex justify-between items-center">
                      <div className="flex-1">
                        <p className="font-medium">{food.food.name}</p>
                        {editingFoodId === food.id ? (
                          <div className="flex items-center gap-2 mt-1">
                            <Input
                              type="number"
                              value={newQuantity}
                              onChange={(e) => setNewQuantity(parseInt(e.target.value) || 0)}
                              className="w-20 h-8"
                              min="1"
                            />
                            <span className="text-sm">g</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2 text-green-600"
                              onClick={() => handleUpdateQuantity(food.id)}
                              disabled={loading}
                            >
                              {loading ? <Loader className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2"
                              onClick={cancelEditingQuantity}
                            >
                              Cancelar
                            </Button>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <span className="font-medium">{food.quantity_grams}g</span> 
                            <span>-</span>
                            <span>{(food.food.calories_per_100g * food.quantity_grams / 100).toFixed(0)} kcal</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 ml-1 text-blue-600 px-2 py-1 text-xs"
                              onClick={() => startEditingQuantity(food)}
                            >
                              Editar
                            </Button>
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:bg-red-50 hover:text-red-800"
                        onClick={() => handleRemoveFood(food.id)}
                        disabled={loading || editingFoodId === food.id}
                      >
                        {loading && !editingFoodId ? <Loader className="h-4 w-4 animate-spin" /> : <Trash2Icon className="h-4 w-4" />}
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
