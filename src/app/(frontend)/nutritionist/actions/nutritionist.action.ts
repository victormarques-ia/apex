'use server'

import { actionHandlerWithValidation } from '@/app/utils/action-handle-with-validation'
import { fetchFromApi } from '@/app/utils/fetch-from-api'
import { error } from 'console';

// Action to get the pacient list
export async function getPacientList(_state: unknown, formData: FormData) {
    return actionHandlerWithValidation(
      formData,
      async (data) => {
        const limit = data.limit || 10;
        const page = data.page || 1;
        const name = data.name || "";
        const sortField = data.sortField || 0;
        const sortOrder = data.sortOrder || "asc";
        const goal = data.goal || "";
  
        // Build the query parameters
        const queryParams = new URLSearchParams();
        queryParams.append('limit', limit as string);
        queryParams.append('page', page as string);
        
        if (name) {
          queryParams.append('name', name as string);
        }
        
        if (sortField) {
          queryParams.append('sortField', sortField as string);
        }
        
        if (sortOrder) {
          queryParams.append('sortOrder', sortOrder as string);
        }
        
        if (goal) {
          queryParams.append('goal', goal as string);
        }
  
        // Fetch the athletes
        const result = await fetchFromApi(`/api/nutritionists/my-athletes?${queryParams.toString()}`, {
          method: 'GET',
        });

        console.log('Resultado: ', result);
        
        if (!result.data?.data) {
          throw new Error(result.error?.messages[0] || 'Erro ao buscar pacientes');
        }
  
        return result.data.data;
      },
      {
        onSuccess: (data) => {
          return {
            success: true,
            ...data,
          };
        },
        onFailure: (error) => {
          return {
            success: false,
            error,
            message: 'Falha ao buscar pacientes',
          };
        },
      }
    );
  }

  //create diet plan
export async function createDietPlanAction(_state:unknown, formData: FormData) {
  return actionHandlerWithValidation(
    formData,
    async (data) => {
      const planData = {
        athlete: data.athleteId,
        nutritionist: data.nutritionistId,
        start_date: data.start_date,
        end_date: data.end_date,
        total_daily_calories: data.total_daily_calories ? parseFloat(data.total_daily_calories as string) : null,
        notes: data.notes || ''
      };

      const result = await fetchFromApi('/api/diet-plans', {
        method: 'POST',
        body: JSON.stringify(planData)
      });

      if (!result.data) {
        throw new Error(result.error?.messages[0] || 'Erro ao criar plano alimentar');
      }

      return result.data;
    },
    {
      onSuccess: (data) => {
        return {
          success: true,
          data,
          message: 'Plano alimentar criado com sucesso'
        };
      },
      onFailure: (error) => {
        return {
          success: false,
          error,
          message: 'Falha ao criar plano alimentar'
        };
      }
    }
  ); 
}


// // Fetch a specific diet plan by ID with all related days and meals
// export async function fetchDietPlanDetailsAction(_state: unknown, formData: FormData) {
//   return actionHandlerWithValidation(
//     formData,
//     async (data) => {
//       const planId = data.planId;
      
//       if (!planId) {
//         throw new Error('ID do plano é obrigatório');
//       }

//       // Fetch the diet plan
//       const result = await fetchFromApi(`/api/diet-plans/${planId}?depth=1`, {
//         method: 'GET',
//       });

//       if (!result.data) {
//         throw new Error(result.error?.messages[0] || 'Erro ao buscar detalhes do plano');
//       }

//       // Fetch all diet plan days for this plan
//       const daysQueryParams = new URLSearchParams();
//       daysQueryParams.append('where', JSON.stringify({
//         diet_plan: {
//           equals: planId,
//         },
//       }));
//       daysQueryParams.append('depth', '1');

//       const daysResult = await fetchFromApi(`/api/diet-plan-days?${daysQueryParams.toString()}`, {
//         method: 'GET',
//       });

//       if (!daysResult.data) {
//         throw new Error('Erro ao buscar dias do plano alimentar');
//       }

//       // For each day, fetch the meals
//       const days = await Promise.all(
//         daysResult.data.docs.map(async (day) => {
//           const mealsQueryParams = new URLSearchParams();
//           mealsQueryParams.append('where', JSON.stringify({
//             diet_plan_day: {
//               equals: day.id,
//             },
//           }));
//           mealsQueryParams.append('depth', '1');

//           const mealsResult = await fetchFromApi(`/api/meal?${mealsQueryParams.toString()}`, {
//             method: 'GET',
//           });

//           if (!mealsResult.data) {
//             throw new Error(`Erro ao buscar refeições para o dia ${day.id}`);
//           }

//           // For each meal, fetch the meal foods
//           const meals = await Promise.all(
//             mealsResult.data.docs.map(async (meal) => {
//               const mealFoodsQueryParams = new URLSearchParams();
//               mealFoodsQueryParams.append('where', JSON.stringify({
//                 meal: {
//                   equals: meal.id,
//                 },
//               }));
//               mealFoodsQueryParams.append('depth', '2'); // We need food details

//               const mealFoodsResult = await fetchFromApi(`/api/meal-food?${mealFoodsQueryParams.toString()}`, {
//                 method: 'GET',
//               });

//               if (!mealFoodsResult.data) {
//                 throw new Error(`Erro ao buscar alimentos para a refeição ${meal.id}`);
//               }

//               return {
//                 ...meal,
//                 foods: mealFoodsResult.data.docs,
//               };
//             })
//           );

//           return {
//             ...day,
//             meals,
//           };
//         })
//       );

//       return {
//         plan: result.data,
//         days,
//       };
//     },
//     {
//       onSuccess: (data) => {
//         return {
//           success: true,
//           data,
//         };
//       },
//       onFailure: (error) => {
//         return {
//           success: false,
//           error,
//           message: 'Falha ao buscar detalhes do plano alimentar',
//         };
//       },
//     }
//   );
// }

// // Create a diet plan day
// export async function createDietPlanDayAction(_state: unknown, formData: FormData) {
//   return actionHandlerWithValidation(
//     formData,
//     async (data) => {
//       const dayData = {
//         diet_plan: data.dietPlanId,
//         date: data.date,
//         day_of_week: data.day_of_week ? parseInt(data.day_of_week as string) : null,
//       };
      
//       const result = await fetchFromApi('/api/diet-plan-days', {
//         method: 'POST',
//         body: JSON.stringify(dayData),
//       });

//       if (!result.data) {
//         throw new Error(result.error?.messages[0] || 'Erro ao criar dia do plano');
//       }

//       return result.data;
//     },
//     {
//       onSuccess: (data) => {
//         return {
//           success: true,
//           data,
//           message: 'Dia do plano criado com sucesso',
//         };
//       },
//       onFailure: (error) => {
//         return {
//           success: false,
//           error,
//           message: 'Falha ao criar dia do plano',
//         };
//       },
//     }
//   );
// }

  
