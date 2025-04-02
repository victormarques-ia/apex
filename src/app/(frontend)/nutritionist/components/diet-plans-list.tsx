'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getAthleteDietPlansAction, deleteDietPlanAction } from '@/app/(frontend)/nutrition/actions/diet-plans.action';
import { format } from 'date-fns';
import { PencilIcon, TrashIcon, PlusIcon } from 'lucide-react';

interface DietPlansListProps {
  athleteId: string;
  onSelectPlan: (plan: any) => void;
  onAddNewPlan: () => void;
  onPlanDeleted: () => void;
  selectedPlanId: string | null;
}

export function DietPlansList({
  athleteId,
  onSelectPlan,
  onAddNewPlan,
  onPlanDeleted,
  selectedPlanId
}: DietPlansListProps) {
  const [dietPlans, setDietPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Track component mount status to avoid state updates after unmount
  const isMounted = React.useRef(true);
  
  // Update local selection when parent selection changes
  useEffect(() => {
    if (selectedPlanId && dietPlans.length > 0) {
      const selectedPlan = dietPlans.find(plan => plan.id === selectedPlanId);
      if (selectedPlan) {
        console.log('Selected plan found:', selectedPlan);
      }
    }
  }, [selectedPlanId, dietPlans]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  // Fetch all diet plans for this athlete
  useEffect(() => {
    const fetchDietPlans = async () => {
      try {
        setLoading(true);

        // Request all diet plans for this athlete without filtering by date
        const formData = new FormData();
        formData.append('athleteId', athleteId);
        // Explicitly not setting a date to get all plans

        const response = await getAthleteDietPlansAction(null, formData);

        console.log('Response getAthleteDietPlansAction in DietPlansList:', response);

        // For direct response from diet-plans endpoint
        if (response.data.docs && Array.isArray(response.data.docs)) {
          // This handles the diet-plan-days with associated diet-plans
          if (response.data.totalDocs > 0) {
            // Extract unique diet plans from diet plan days
            const uniquePlans = [];
            const planIds = new Set();

            response.data.docs.forEach(item => {
              if (item.diet_plan && !planIds.has(item.diet_plan.id)) {
                planIds.add(item.diet_plan.id);
                uniquePlans.push(item.diet_plan);
              }
            });

            console.log(`Found ${uniquePlans.length} unique diet plans`);
            setDietPlans(uniquePlans);
          } else {
            // If the API returns diet plans directly
            console.log(`Found ${response.data.docs.length} diet plans directly`);
            setDietPlans(response.data.docs);
          }
        } else {
          setDietPlans([]);
        }
      } catch (err) {
        console.error('Error fetching diet plans:', err);
        setError(`Erro ao buscar planos alimentares: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    if (athleteId) {
      fetchDietPlans();
    }
  }, [athleteId]);

  // Handle plan deletion
  const handleDeletePlan = async (planId: string) => {
    if (!confirm('Tem certeza que deseja excluir este plano alimentar? Todas as refeições associadas também serão excluídas.')) {
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('dietPlanId', planId);

      const response = await deleteDietPlanAction(null, formData);

      console.log('Response deleteDietPlanAction:', response);

      if (response.data.success) {
        // Remove from local list
        setDietPlans(dietPlans.filter(plan => plan.id !== planId));
        // Notify parent component
        if (onPlanDeleted) {
          onPlanDeleted();
        }
      } else {
        setError('Erro ao excluir plano alimentar');
      }
    } catch (err) {
      console.error('Error deleting diet plan:', err);
      setError('Erro ao excluir plano alimentar');
    } finally {
      setLoading(false);
    }
  };

  if (loading && dietPlans.length === 0) {
    return (
      <Card className="mb-4">
        <CardContent className="pt-4">
          <div className="flex justify-center items-center h-20">
            <p className="text-muted-foreground">Carregando planos alimentares...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Planos Alimentares</CardTitle>
          <Button
            size="sm"
            onClick={onAddNewPlan}
            variant="outline"
          >
            <PlusIcon className="h-4 w-4 mr-1" /> Novo Plano
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded mb-4">
            {error}
          </div>
        )}

        {dietPlans.length === 0 ? (
          <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-200">
            <p className="text-gray-500 mb-2">Nenhum plano alimentar encontrado</p>
            <Button
              variant="outline"
              size="sm"
              onClick={onAddNewPlan}
            >
              <PlusIcon className="h-4 w-4 mr-1" /> Criar Plano Alimentar
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {dietPlans.map(plan => (
              <div
                key={plan.id}
                className={`p-3 rounded-md flex justify-between items-center cursor-pointer ${
                  selectedPlanId === plan.id ? 'bg-primary/10 border border-primary/30' : 'bg-gray-50 hover:bg-gray-100'
                }`}
                onClick={() => onSelectPlan(plan)}
              >
                <div className="flex-1">
                  <div className="font-medium">
                    Plano de {format(new Date(plan.start_date), 'dd/MM/yyyy')} a {format(new Date(plan.end_date), 'dd/MM/yyyy')}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {plan.total_daily_calories ? `${plan.total_daily_calories} calorias/dia` : 'Sem calorias definidas'}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onSelectPlan(plan)}
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => handleDeletePlan(plan.id)}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
