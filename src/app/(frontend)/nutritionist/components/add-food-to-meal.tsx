'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Search, Plus, X, Loader } from 'lucide-react';
import { searchFoodsAction } from '@/app/(frontend)/nutrition/actions/foods.action';
import { addFoodToMealAction } from '@/app/(frontend)/nutrition/actions/meal-plan.action';

interface AddFoodToMealProps {
  mealId: string;
  onFoodAdded: () => void;
  onCancel: () => void;
}

export function AddFoodToMeal({ mealId, onFoodAdded, onCancel }: AddFoodToMealProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [foods, setFoods] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [quantity, setQuantity] = useState(100);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Search foods when query changes
  useEffect(() => {
    if (searchQuery.length < 2) {
      setFoods([]);
      return;
    }

    searchFoods();
  }, [searchQuery]);

  // Search foods
  const searchFoods = async () => {
    try {
      const formData = new FormData();
      formData.append('q', searchQuery);
      formData.append('limit', '10');
      const result = await searchFoodsAction(null, formData);
      const foodDocs = result.data?.docs || [];
      setFoods(foodDocs);
    } catch (err) {
      console.error('Error searching foods:', err);
      setFoods([]);
    }
  };

  // Add food to meal
  const handleAddFoodToMeal = async () => {
    if (!selectedFood || !mealId) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('mealId', mealId);
      formData.append('foodId', selectedFood.id.toString());
      formData.append('quantity', quantity.toString());

      const result = await addFoodToMealAction(null, formData);

      console.log('Response addFoodToMealAction:', result);

      if (result.data) {
        // Reset form
        setSelectedFood(null);
        setSearchQuery('');
        setQuantity(100);
        setFoods([]);

        // Notify parent component
        if (onFoodAdded) {
          onFoodAdded();
        }
      } else {
        setError(result.message || 'Erro ao adicionar alimento');
      }
    } catch (err) {
      console.error('Error adding food to meal:', err);
      setError('Falha ao adicionar alimento à refeição');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Adicionar Alimento à Refeição</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Search for foods */}
          <div className="space-y-2">
            <Label>Buscar Alimento:</Label>
            <div className="relative">
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Digite o nome do alimento"
                className="pl-10"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>

            {/* Search results */}
            {foods.length > 0 && (
              <div className="mt-2 border rounded max-h-48 overflow-y-auto">
                {foods.map((food) => (
                  <div
                    key={food.id}
                    className={`p-2 hover:bg-gray-100 cursor-pointer ${selectedFood?.id === food.id ? 'bg-blue-50' : ''}`}
                    onClick={() => {
                      setSelectedFood(food);
                      setSearchQuery(food.name);
                      setFoods([]);
                    }}
                  >
                    <p className="font-medium">{food.name}</p>
                    <p className="text-sm text-gray-600">
                      {food.calories_per_100g} kcal | P: {food.protein_per_100g}g | C: {food.carbs_per_100g}g | G: {food.fat_per_100g}g
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected food and quantity */}
          {selectedFood && (
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>Alimento Selecionado:</Label>
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => {
                    setSelectedFood(null);
                    setSearchQuery('');
                  }}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="p-2 border rounded bg-gray-50">
                <p className="font-medium">{selectedFood.name}</p>
                <p className="text-sm text-gray-600">
                  {selectedFood.calories_per_100g} kcal | P: {selectedFood.protein_per_100g}g | C: {selectedFood.carbs_per_100g}g | G: {selectedFood.fat_per_100g}g
                </p>
              </div>

              <div>
                <Label htmlFor="quantity">Quantidade (g):</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                  min="1"
                />
              </div>
            </div>
          )}
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
          onClick={handleAddFoodToMeal}
          disabled={!selectedFood || loading}
        >
          {loading ? (
            <Loader className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Plus className="h-4 w-4 mr-2" />
          )}
          Adicionar
        </Button>
      </CardFooter>
    </Card>
  );
}
