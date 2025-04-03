import { Endpoint, PayloadRequest } from 'payload'

async function getLoggedInNutritionistId(req: PayloadRequest) {
  if (!req.user) {
    throw new Error('Usuário não autenticado');
  }

  const userId = req.user.id;

  const nutritionistProfiles = await req.payload.find({
    collection: 'nutritionists',
    where: {
      user: {
        equals: userId,
      },
    },
    limi: 1,
  });

  if (!nutritionistProfiles.docs || nutritionistProfiles.docs.length === 0) {
    throw new Error('Perfil de nutricionista não encontrado para este usuário');
  }

  return nutritionistProfiles.docs[0].id;
}

export const NutritionistApi: Endpoint[] = [
  {
    // listar todos os pacientes daquele nutricionista
    method: 'get',
    path: '/my-athletes',
    handler: async (req: PayloadRequest) => {
      try {
        const nutritionistId = await getLoggedInNutritionistId(req);
        const name = req.query.name as string || "";
        const sortOrder = req.query.sortOrder as string || "asc";
        // Você pode ordenar por nome, data da ultima atualizacao e meta.
        // Exemplo: athlete.user.name, athlete.updatedAt, athlete.goal
        const sortFields = ['athlete.user.name', 'athlete.updatedAt', 'athlete.goal'];
        const sortField = req.query.sortField as number || 0;
        const goal = req.query.goal as string || "";

        // /api/nutritionists/my-athletes?name=renata
        // teste por ordem ascendente de nome
        // /api/nutritionists/my-athletes?name=renata&sortOrder=desc
        // teste por ordem ascendente de data de ultima atualizacao
        // /api/nutritionists/my-athletes?sortOrder=asc&sortField=1
        // teste por ordem ascendente de meta
        // /api/nutritionists/my-athletes?sortOrder=asc&sortField=2
        // api/nutritionists/my-athletes?goal=emagrecimento

        const nutritionistAthletes = await req.payload.find({
          collection: 'nutritionist-athletes',
          where: {
            and: [
              {
                nutritionist: {
                  equals: nutritionistId,
                }
              },
              ...(name.trim() ? [{
                'athlete.user.name': {
                  like: name,
                }
              }] : []),
              ...(goal.trim() ? [{
                'athlete.goal': {
                  like: goal,
                }
              }] : [])
            ]
          },
          depth: 2,
          sort: sortOrder.toLowerCase() === "desc" ?
            `-${sortFields[sortField] || sortFields[0]}` :
            (sortFields[sortField] || sortFields[0]),
          limit: 100,
        });

        // Extrai apenas os perfis de atletas da lista de relacionamentos
        const athletes = nutritionistAthletes.docs.map(relation => relation.athlete);

        return Response.json({
          data: {
            total: nutritionistAthletes.totalDocs,
            athletes: athletes,
          },
        });

      } catch (error) {
        console.error('[NutritionistApi][athletes]:', error);
        return Response.json(
          {
            errors: [{ message: 'Erro inesperado ao buscar pacientes do nutricionista' }],
          },
          { status: 500 }
        );
      }
    },
  },
  {
    // escolhendo apenas um paciente para ver mais detalhes sobre
    method: 'get',
    path: '/my-athletes/:id',
    handler: async (req: PayloadRequest) => {
      try {
        const nutritionistId = await getLoggedInNutritionistId(req);
        const athleteId = req.routeParams?.id;

        const { from, to } = req.query;

        // Fetch the diet-plan
        const Meals = await req.payload.find({
          collection: 'meal',
          where: {
            and: [
              {
                "diet_plan_day.diet_plan.athlete": {
                  equals: athleteId,
                },
              },
              {
                "diet_plan_day.diet_plan.nutritionist": {
                  equals: nutritionistId,
                },
              }
            ],
          },
          depth: 2,
          limit: 50,
        });

        return Response.json({
          data: Meals,
        });
      } catch (error) {
        console.error('[NutritionistApi][athleteById]:', error);
        return Response.json(
          {
            errors: [{ message: 'Erro inesperado ao buscar o atleta' }],
          },
          { status: 500 }
        );
      }
    },
  },
  {
    method: 'get',
    path: '/diet-plans',
    handler: async (req) => {
      try {
        const { athleteId, date } = req.query;
        const nutritionistId = await getLoggedInNutritionistId(req);

        // Check if it has a diet plan associated with it
        const dietPlan = await req.payload.find({
          collection: 'diet-plans',
          where: {
            and: [
              {
                athlete: {
                  equals: athleteId,
                },
              },
              {
                nutritionist: {
                  equals: nutritionistId,
                },
              },
              date ? {
                start_date: {
                  less_than_equal: date as string,
                },
              } : {},
              date ? {
                end_date: {
                  greater_than_equal: date as string,
                },
              } : {}
            ],
          },
          depth: 2,
        });

        if (!athleteId) throw new Error('Athlete ID required');

        return Response.json(dietPlan)

      } catch (error) {
        console.error('[NutritionistApi][diet-plans-days]:', error);
        return Response.json({
          errors: [{ message: 'Erro inesperado ao buscar dia do plano alimentar.' }]
        }, { status: 500 })
      }
    }
  },
  {
    method: 'get',
    path: '/diet-plan-days',
    handler: async (req) => {
      try {
        const { athleteId, date, dietPlanId } = req.query;
        const nutritionistId = await getLoggedInNutritionistId(req);

        // Check if it has a diet plan associated with it
        const dietPlan = await req.payload.find({
          collection: 'diet-plans',
          where: {
            and: [
              dietPlanId ? {
                id: {
                  equals: dietPlanId,
                },
              } : {},
              {
                athlete: {
                  equals: athleteId,
                },
              },
              {
                nutritionist: {
                  equals: nutritionistId,
                },
              },
            ],
          },
          depth: 2,
        });

        if (!athleteId) throw new Error('Athlete ID required');

        // Basic query to get all diet plan days for this athlete-nutritionist pair
        const query = {
          and: [
            dietPlanId ? {
              'diet_plan.id': { equals: dietPlanId }
            } : {},
            {
              'diet_plan.athlete.id': { equals: athleteId }
            },
            {
              'diet_plan.nutritionist.id': { equals: nutritionistId }
            }
          ]
        };

        // First, get all diet plan days
        const allDays = await req.payload.find({
          collection: 'diet-plan-days',
          where: query,
          depth: 2,
          limit: 100, // Increased to ensure we capture all relevant days
        });

        // If date is provided, filter for recurring diet plan days
        if (date) {
          const targetDate = new Date(date as string);

          // Filter days that apply to the target date based on repeat interval
          const applicableDays = allDays.docs.filter(day => {
            const dayDate = new Date(day.date);

            // If exact date match, always include
            if (dayDate.toISOString().split('T')[0] === targetDate.toISOString().split('T')[0]) {
              return true;
            }

            // If day has repeat interval and is before target date
            if (day.repeat_interval_days && dayDate <= targetDate) {
              // Calculate days between
              const diffTime = targetDate.getTime() - dayDate.getTime();
              const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

              // Check if target date falls on a repeat cycle
              return diffDays % day.repeat_interval_days === 0;
            }

            return false;
          });

          // If we found applicable days, return them
          if (applicableDays.length > 0) {
            return Response.json({
              docs: applicableDays,
              totalDocs: applicableDays.length,
              page: 1,
              totalPages: 1,
              limit: applicableDays.length
            });
          }
        }

        return Response.json(allDays);

        // If date 
        // Fallback: If no days found, find a diet plan that covers the target date
        // const dietPlans = await req.payload.find({
        //   collection: 'diet-plans',
        //   where: {
        //     and: [
        //       { athlete: { equals: athleteId } },
        //       { nutritionist: { equals: nutritionistId } },
        //     ]
        //   },
        //   sort: '-createdAt', // Most recent first if multiple match
        //   depth: 2,
        //   limit: 1
        // });

        // Create synthetic response with diet plan but no diet plan day
        // return Response.json({
        //   docs: [{
        //     id: null,
        //     diet_plan: dietPlans?.docs[0],
        //     date: null,
        //     day_of_week: null,
        //     repeat_interval_days: null,
        //     updatedAt: null,
        //     createdAt: null
        //   }],
        //   totalDocs: 1,
        //   page: 1,
        //   totalPages: 1,
        //   limit: 1
        // });

      } catch (error) {
        console.error('[NutritionistApi][diet-plans-days]:', error);
        return Response.json({
          errors: [{ message: 'Erro inesperado ao buscar dia do plano alimentar.' }]
        }, { status: 500 })
      }
    }
  },
  {
    method: 'get',
    path: '/meals',
    handler: async (req) => {
      try {
        const { athleteId } = req.query;
        if (!athleteId) throw new Error('Athlete ID required');

        const meals = await req.payload.find({
          collection: 'meal',
          where: {
            'diet_plan_day.diet_plan.athlete.id': { equals: athleteId }
          },
          depth: 2
        });

        return Response.json(meals);
      } catch (error) {
        return Response.json({
          errors: [{ message: 'Erro inesperado ao buscar as refeições.' }]
        })
      }
    }
  },
  {
    method: 'post',
    path: '/create-diet-plan',
    handler: async (req: PayloadRequest) => {
      try {
        // Authentication check
        const nutritionistId = await getLoggedInNutritionistId(req);

        // Parse request body
        const data = await req.json?.();
        if (!data) {
          return Response.json(
            { errors: [{ message: 'Corpo da requisição inválido' }] },
            { status: 400 }
          );
        }

        // Validate required fields
        if (!data.athleteId) {
          return Response.json(
            { errors: [{ message: 'ID do atleta é obrigatório' }] },
            { status: 400 }
          );
        }

        const athleteId = parseInt(String(data.athleteId), 10);

        // Validate required date fields
        if (!data.startDate) {
          return Response.json(
            { errors: [{ message: 'Data de início é obrigatória' }] },
            { status: 400 }
          );
        }

        if (!data.endDate) {
          return Response.json(
            { errors: [{ message: 'Data de término é obrigatória' }] },
            { status: 400 }
          );
        }

        const startDate = data.startDate;
        const endDate = data.endDate;

        // Create new diet plan
        const dietPlanData = {
          athlete: athleteId,
          nutritionist: nutritionistId,
          start_date: startDate,
          end_date: endDate,
          total_daily_calories: data.totalDailyCalories || 0,
          notes: data.notes || null
        };

        // Search for existing diet plans in the same date range
        const existingDietPlans = await req.payload.find({
          collection: 'diet-plans',
          where: {
            and: [
              {
                athlete: {
                  equals: athleteId,
                },
              },
              {
                nutritionist: {
                  equals: nutritionistId,
                },
              },
              {
                or: [
                  {
                    and: [
                      {
                        start_date: {
                          less_than_equal: startDate,
                        },
                      },
                      {
                        end_date: {
                          greater_than_equal: endDate,
                        }
                      }
                    ]
                  },
                  {
                    and: [
                      {
                        start_date: {
                          less_than_equal: startDate,
                        },
                      },
                      {
                        end_date: {
                          greater_than_equal: endDate,
                        }
                      }
                    ]
                  }
                ]
              },
            ],
          },
          depth: 2,
        });

        console.log('Existing diet plans:', existingDietPlans);

        if (existingDietPlans.totalDocs > 0) {
          throw new Error('Plano de refeição já cadastrado');
        }

        const dietPlan = await req.payload.create({
          collection: 'diet-plans',
          data: dietPlanData
        });

        const dietPlanId = dietPlan.id;

        // Return response with created entities
        return Response.json(dietPlan);
      } catch (error) {
        console.error('[NutritionistApi][create-diet-plan]:', error);
        const errorMessage = error instanceof Error ? error.message : 'Erro inesperado ao criar plano alimentar';
        return Response.json({ errors: [{ message: errorMessage }] }, { status: 500 });
      }
    }
  },
  {
    method: 'get',
    path: '/diet-plan/:id',
    handler: async (req: PayloadRequest) => {
      try {
        const nutritionistId = await getLoggedInNutritionistId(req);
        const dietPlanId = req.routeParams?.id;

        if (!dietPlanId) {
          return Response.json(
            { errors: [{ message: 'ID do plano alimentar é obrigatório' }] },
            { status: 400 }
          );
        }

        // Get the diet plan with its associated diet plan day
        const dietPlan = await req.payload.find({
          collection: 'diet-plans',
          where: {
            and: [
              {
                id: { equals: dietPlanId }
              },
              {
                nutritionist: { equals: nutritionistId }
              }
            ]
          },
          depth: 2
        });

        // Find the associated diet plan day
        const dietPlanDays = await req.payload.find({
          collection: 'diet-plan-days',
          where: {
            diet_plan: {
              equals: dietPlanId
            }
          },
          depth: 1,
          limit: 1
        });

        return Response.json({
          dietPlan: dietPlan,
          dietPlanDay: dietPlanDays
        });
      } catch (error) {
        console.error('[NutritionistApi][diet-plan]:', error);
        const errorMessage = error instanceof Error ? error.message : 'Erro inesperado ao buscar plano alimentar';
        return Response.json({ errors: [{ message: errorMessage }] }, { status: 500 });
      }
    }
  },
  {
    method: 'put',
    path: '/diet-plan/:id',
    handler: async (req: PayloadRequest) => {
      try {
        const nutritionistId = await getLoggedInNutritionistId(req);
        const dietPlanId = req.routeParams?.id;

        if (!dietPlanId) {
          return Response.json(
            { errors: [{ message: 'ID do plano alimentar é obrigatório' }] },
            { status: 400 }
          );
        }

        // Parse request body
        const data = await req.json?.();

        console.log('data diet-plan update:', data);
        if (!data) {
          return Response.json(
            { errors: [{ message: 'Corpo da requisição inválido' }] },
            { status: 400 }
          );
        }

        // Verify the diet plan exists and belongs to this nutritionist
        const dietPlan = await req.payload.find({
          collection: 'diet-plans',
          where: {
            and: [
              {
                id: { equals: dietPlanId }
              },
              {
                nutritionist: { equals: nutritionistId }
              }
            ]
          },
          depth: 2
        });

        if (!dietPlan) {
          return Response.json(
            { errors: [{ message: 'Plano alimentar não encontrado' }] },
            { status: 404 }
          );
        }

        // Update the diet plan with the provided data
        const updateData = {
          ...(data.startDate && { start_date: data.startDate }),
          ...(data.endDate && { end_date: data.endDate }),
          ...(data.totalDailyCalories !== undefined && { total_daily_calories: data.totalDailyCalories }),
          ...(data.notes !== undefined && { notes: data.notes })
        };

        const updatedDietPlan = await req.payload.update({
          collection: 'diet-plans',
          id: dietPlanId,
          data: updateData
        });

        return Response.json({
          success: true,
          dietPlan: updatedDietPlan
        });

      } catch (error) {
        console.error('[NutritionistApi][update-diet-plan]:', error);
        const errorMessage = error instanceof Error ? error.message : 'Erro inesperado ao atualizar plano alimentar';
        return Response.json({ errors: [{ message: errorMessage }] }, { status: 500 });
      }
    }
  },
  {
    method: 'put',
    path: '/diet-plan-day/:id',
    handler: async (req: PayloadRequest) => {
      try {
        const nutritionistId = await getLoggedInNutritionistId(req);
        const dietPlanDayId = req.routeParams?.id;

        if (!dietPlanDayId) {
          return Response.json(
            { errors: [{ message: 'ID do dia do plano alimentar é obrigatório' }] },
            { status: 400 }
          );
        }

        // Parse request body
        const data = await req.json?.();

        console.log('data diet-plan-day update:', data);
        if (!data) {
          return Response.json(
            { errors: [{ message: 'Corpo da requisição inválido' }] },
            { status: 400 }
          );
        }

        // Verify the diet plan day exists and belongs to this nutritionist
        const dietPlanDay = await req.payload.find({
          collection: 'diet-plan-days',
          where: {
            and: [
              {
                id: { equals: dietPlanDayId }
              },
              {
                'diet_plan.nutritionist': { equals: nutritionistId }
              }
            ]
          },
          depth: 2
        });

        if (!dietPlanDay.docs || dietPlanDay.docs.length === 0) {
          return Response.json(
            { errors: [{ message: 'Dia do plano alimentar não encontrado' }] },
            { status: 404 }
          );
        }

        // Update the diet plan day with the provided data
        const updateDayData = {
          ...(data.date && { date: data.date }),
          ...(data.repeatIntervalDays !== undefined && { repeat_interval_days: data.repeatIntervalDays }),
          ...(data.dayOfWeek && { day_of_week: data.dayOfWeek })
        };

        const updatedDietPlanDay = await req.payload.update({
          collection: 'diet-plan-days',
          id: dietPlanDayId,
          data: updateDayData
        });

        return Response.json({
          success: true,
          dietPlanDay: updatedDietPlanDay
        });

      } catch (error) {
        console.error('[NutritionistApi][update-diet-plan-day]:', error);
        const errorMessage = error instanceof Error ? error.message : 'Erro inesperado ao atualizar dia do plano alimentar';
        return Response.json({ errors: [{ message: errorMessage }] }, { status: 500 });
      }
    }
  },
  {
    method: 'delete',
    path: '/diet-plan/:id',
    handler: async (req: PayloadRequest) => {
      try {
        const nutritionistId = await getLoggedInNutritionistId(req);
        const dietPlanId = req.routeParams?.id;

        if (!dietPlanId) {
          return Response.json(
            { errors: [{ message: 'ID do plano alimentar é obrigatório' }] },
            { status: 400 }
          );
        }

        // Delete mealfood associated with this diet plan
        await req.payload.delete({
          collection: 'meal-food',
          where: {
            and: [
              {
                'meal.diet_plan_day.diet_plan.id': { equals: dietPlanId },
              },
              {
                'meal.diet_plan_day.diet_plan.nutritionist.id': { equals: nutritionistId },
              },
            ],
          },
        });

        // Delete meals associated with this diet plan
        await req.payload.delete({
          collection: 'meal',
          where: {
            and: [
              {
                'diet_plan_day.diet_plan.id': { equals: dietPlanId },
              },
              {
                'diet_plan_day.diet_plan.nutritionist.id': { equals: nutritionistId },
              }
            ],
          },
          depth: 5,
        });

        // Delete the diet plan days associated with this diet plan
        await req.payload.delete({
          collection: 'diet-plan-days',
          where: {
            and: [
              {
                'diet_plan.id': { equals: dietPlanId },
              },
              {
                'diet_plan.nutritionist.id': { equals: nutritionistId },
              }
            ],
          },
          depth: 4,
        });

        // Delete the diet plan itself
        await req.payload.delete({
          collection: 'diet-plans',
          where: {
            and: [
              {
                id: { equals: dietPlanId },
              },
              {
                nutritionist: { equals: nutritionistId },
              }
            ],
          },
        });

        return Response.json({
          success: true,
          message: 'Plano alimentar e todos os dias/refeições associados foram excluídos com sucesso'
        });
      } catch (error) {
        console.error('[NutritionistApi][delete-diet-plan]:', error);
        const errorMessage = error instanceof Error ? error.message : 'Erro inesperado ao excluir plano alimentar';
        return Response.json({ errors: [{ message: errorMessage }] }, { status: 500 });
      }
    }
  },
  {
    method: 'delete',
    path: '/diet-plan-day/:id',
    handler: async (req: PayloadRequest) => {
      try {
        const nutritionistId = await getLoggedInNutritionistId(req);
        const dietPlanDayId = req.routeParams?.id;

        if (!dietPlanDayId) {
          return Response.json(
            { errors: [{ message: 'ID do plano alimentar é obrigatório' }] },
            { status: 400 }
          );
        }

        // Delete mealfood associated with this diet plan day
        await req.payload.delete({
          collection: 'meal-food',
          where: {
            and: [
              {
                'meal.diet_plan_day.id': { equals: dietPlanDayId },
              },
              {
                'meal.diet_plan_day.diet_plan.nutritionist.id': { equals: nutritionistId },
              },
            ],
          },
          depth: 5,
        });

        // Delete meals associated with this diet plan day
        await req.payload.delete({
          collection: 'meal',
          where: {
            and: [
              {
                'diet_plan_day.id': { equals: dietPlanDayId },
              },
              {
                'diet_plan_day.diet_plan.nutritionist.id': { equals: nutritionistId },
              }
            ],
          },
          depth: 5,
        });

        // Delete the diet plan day itself
        await req.payload.delete({
          collection: 'diet-plan-days',
          where: {
            and: [
              {
                id: { equals: dietPlanDayId },
              },
              {
                'diet_plan.nutritionist': { equals: nutritionistId },
              }
            ],
          },
        });

        return Response.json({
          success: true,
          message: 'Plano diário e todas as refeições associadas foram excluídos com sucesso'
        });
      } catch (error) {
        console.error('[NutritionistApi][delete-diet-plan-day]:', error);
        const errorMessage = error instanceof Error ? error.message : 'Erro inesperado ao excluir plano diário';
        return Response.json({ errors: [{ message: errorMessage }] }, { status: 500 });
      }
    }
  }
];
