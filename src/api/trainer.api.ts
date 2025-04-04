import { fetchFromApi } from '@/app/utils/fetch-from-api';
import { Endpoint, PayloadRequest } from 'payload'

async function getLoggedInTrainerId(req: PayloadRequest) {
  if (!req.user) {
    throw new Error('Usuário não autenticado');
  }

  const userId = req.user.id;

  const trainerProfiles = await req.payload.find({
    collection: 'trainers',
    where: {
      user: {
        equals: userId,
      },
    },
    limit: 1,
  });

  if (!trainerProfiles.docs || trainerProfiles.docs.length === 0) {
    throw new Error('Perfil de treinador não encontrado para este usuário');
  }

  return trainerProfiles.docs[0].id;
}

export const TrainerApi: Endpoint[] = [
  {
    method: 'get',
    path: '/athletes',
    handler: async (req: PayloadRequest) => {
      try {
        const idTrainer = await getLoggedInTrainerId(req);
        const name = req.query.name as string || "";
        const sortOrder = req.query.sortOrder as string || "asc";
        // Você pode ordenar por nome, data da ultima atualizacao e meta.
        // Exemplo: athlete.user.name, athlete.updatedAt, athlete.goal
        const sortFields = [ 'athlete.user.name', 'athlete.updatedAt', 'athlete.goal' ];
        const sortField = req.query.sortField as number || 0;
        const goal = req.query.goal as string || "";

        // /api/trainer/my-athletes?name=renata
        // teste por ordem ascendente de nome
        // /api/trainer/my-athletes?name=renata&sortOrder=desc
        // teste por ordem ascendente de data de ultima atualizacao
        // /api/trainer/my-athletes?sortOrder=asc&sortField=1
        // teste por ordem ascendente de meta
        // /api/trainer/my-athletes?sortOrder=asc&sortField=2
        // api/trainer/my-athletes?goal=emagrecimento

        const trainerAthletes = await req.payload.find({
          collection: 'trainer-athletes',
          where: {
            and: [
              {
                trainer: {
                  equals: idTrainer,
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
        const athletes = trainerAthletes.docs.map(relation => relation.athlete);

        return Response.json({
          data: {
            total: trainerAthletes.totalDocs,
            athletes: athletes,
          },
        });

      } catch (error) {
        console.error('[TrainerApi][search]:', error);
        return Response.json(
          {
            errors: [{ message: 'Erro inesperado ao pesquisar pacientes do treinador' }],
          },
          { status: 500 }
        );
      }
    },
  },
  {
    method: 'get',
    path: '/workout-plans',
    handler: async (req) => {
      try {
        const { athleteId, date, workoutPlanId } = req.query;
        const trainerId = await getLoggedInTrainerId(req);

        // Check if it has a diet plan associated with it
        const workoutPlans = await req.payload.find({
          collection: 'workout-plans',
          where: {
            and: [
              workoutPlanId ? {
                id: {
                  equals: workoutPlanId
                }
              } : {},
              {
                athlete: {
                  equals: athleteId,
                },
              },
              {
                trainer: {
                  equals: trainerId,
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

        return Response.json(workoutPlans)

      } catch (error) {
        console.error('[TrainerApi][workout-plans]:', error);
        return Response.json({
          errors: [{ message: 'Erro inesperado ao buscar planos de treino.' }]
        }, { status: 500 })
      }
    }
  },
  {
    method: 'post',
    path: '/workout-plans',
    handler: async (req: PayloadRequest) => {
      try {
        // Authentication check
        const trainerId = await getLoggedInTrainerId(req);

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
        const workoutPlanData = {
          athlete: athleteId,
          trainer: trainerId,
          start_date: startDate,
          end_date: endDate,
          goal: data.goal || null
        };

        // Search for existing diet plans in the same date range
        const existingWorkoutPlans = await req.payload.find({
          collection: 'workout-plans',
          where: {
            and: [
              {
                athlete: {
                  equals: athleteId,
                },
              },
              {
                trainer: {
                  equals: trainerId,
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

        console.log('Existing workout plans:', existingWorkoutPlans);

        if (existingWorkoutPlans.totalDocs > 0) {
          throw new Error('Plano de treino já cadastrado');
        }

        const workoutPlan = await req.payload.create({
          collection: 'workout-plans',
          data: workoutPlanData
        });

        // Return response with created entities
        return Response.json(workoutPlan);
      } catch (error) {
        console.error('[TrainerApi][create-workout-plan]:', error);
        const errorMessage = error instanceof Error ? error.message : 'Erro inesperado ao criar plano de treino';
        return Response.json({ errors: [{ message: errorMessage }] }, { status: 500 });
      }
    }
  },
  {
    method: 'put',
    path: '/workout-plans/:id',
    handler: async (req: PayloadRequest) => {
      try {
        const trainerId = await getLoggedInTrainerId(req);
        const workoutPlanId = req.routeParams?.id;

        if (!workoutPlanId) {
          return Response.json(
            { errors: [{ message: 'ID do plano de treino é obrigatório' }] },
            { status: 400 }
          );
        }
        const workoutPlanIdTransformed = parseInt(String(workoutPlanId), 10);
        // Parse request body
        const data = await req.json?.();

        console.log('data workout-plan update:', data);
        if (!data) {
          return Response.json(
            { errors: [{ message: 'Corpo da requisição inválido' }] },
            { status: 400 }
          );
        }

        // Verify the diet plan exists and belongs to this trainer
        const workoutPlan = await req.payload.find({
          collection: 'workout-plans',
          where: {
            and: [
              {
                id: { equals: workoutPlanIdTransformed }
              },
              {
                trainer: { equals: trainerId }
              }
            ]
          },
          depth: 2
        });

        if (workoutPlan.totalDocs === 0) {
          return Response.json(
            { errors: [{ message: 'Plano de treino não encontrado' }] },
            { status: 404 }
          );
        }

        // Update the diet plan with the provided data
        const updateData = {
          ...(data.startDate && { start_date: data.startDate }),
          ...(data.endDate && { end_date: data.endDate }),
          ...(data.goal !== undefined && { goal: data.goal })
        };

        const existingWorkoutPlans = await req.payload.find({
          collection: 'workout-plans',
          where: {
            and: [
              { id: { not_equals: workoutPlanIdTransformed } },
              {
                or: [
                  {
                    and: [
                      {
                        start_date: {
                          less_than_equal: data.startDate,
                        },
                      },
                      {
                        end_date: {
                          greater_than_equal: data.endDate,
                        }
                      }
                    ]
                  },
                  {
                    and: [
                      {
                        start_date: {
                          less_than_equal: data.startDate,
                        },
                      },
                      {
                        end_date: {
                          greater_than_equal: data.endDate,
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

        if (existingWorkoutPlans.totalDocs > 0) {
          throw new Error('Plano de treino já cadastrado');
        }


        const updatedTrainPlan = await req.payload.update({
          collection: 'workout-plans',
          id: workoutPlanIdTransformed,
          data: updateData
        });

        return Response.json({
          success: true,
          dietPlan: updatedTrainPlan
        });

      } catch (error) {
        console.error('[TrainerApi][update-workout-plan]:', error);
        const errorMessage = error instanceof Error ? error.message : 'Erro inesperado ao atualizar plano de treino';
        return Response.json({ errors: [{ message: errorMessage }] }, { status: 500 });
      }
    }
  },
  {
    method: 'delete',
    path: '/workout-plans/:id',
    handler: async (req: PayloadRequest) => {
      try {
        const trainerId = await getLoggedInTrainerId(req);
        const workoutPlanId = req.routeParams?.id;

        if (!workoutPlanId) {
          return Response.json(
            { errors: [{ message: 'ID do plano de treino é obrigatório' }] },
            { status: 400 }
          );
        }
        const workoutPlanIdTransformed = parseInt(String(workoutPlanId), 10);

        // Delete exerciseWorkouts associated with this workout plan
        await req.payload.delete({
          collection: 'exercise-workouts',
          where: {
            and: [
              {
                workout_plan: { equals: workoutPlanIdTransformed },
              },
              {
                "workout_plan.trainer": { equals: trainerId },
              },
            ],
          },
        });

        // Delete workoutPlan itself
        await req.payload.delete({
          collection: 'workout-plans',
          where: {
            and: [
              {
                id: { equals: workoutPlanIdTransformed },
              },
              {
                trainer: { equals: trainerId },
              },
            ],
          },
        });

        return Response.json({
          success: true,
          message: 'Plano de treino excluído com sucesso'
        });
      } catch (error) {
        console.error('[TrainerApi][delete-workout-plan]:', error);
        const errorMessage = error instanceof Error ? error.message : 'Erro inesperado ao excluir plano de treino';
        return Response.json({ errors: [{ message: errorMessage }] }, { status: 500 });
      }
    }
  },
  {
    method: 'get',
    path: '/exercise-workouts',
    handler: async (req) => {
      try {
        const { exerciseId, workoutPlanId } = req.query;
        
        // Check if it has a diet plan associated with it
        const exerciseWorkouts = await req.payload.find({
          collection: 'exercise-workouts',
          where: {
            and: [
              workoutPlanId ? {
                workout_plan: {
                  equals: workoutPlanId
                }
              } : {},
              exerciseId ? {
                exercise: {
                  equals: exerciseId
                }
              } : {}
            ],
          },
          depth: 2,
        });

        return Response.json(exerciseWorkouts)

      } catch (error) {
        console.error('[TrainerApi][exercise-workouts]:', error);
        return Response.json({
          errors: [{ message: 'Erro inesperado ao buscar exercicios de treino.' }]
        }, { status: 500 })
      }
    }
  },
  {
    method: 'post',
    path: '/exercise-workouts',
    handler: async (req: PayloadRequest) => {
      try {
        // Parse request body
        const data = await req.json?.();
        if (!data) {
          return Response.json(
            { errors: [{ message: 'Corpo da requisição inválido' }] },
            { status: 400 }
          );
        }

        // Validate required fields
        if (!data.workoutPlanId) {
          return Response.json(
            { errors: [{ message: 'ID do plano de treino é obrigatório' }] },
            { status: 400 }
          );
        }

        if (!data.exerciseId) {
          return Response.json(
            { errors: [{ message: 'ID do exercício é obrigatório' }] },
            { status: 400 }
          );
        }

        if (!data.sets) {
          return Response.json(
            { errors: [{ message: 'conjuntos são obrigatórios' }] },
            { status: 400 }
          );
        }

        if (!data.reps) {
          return Response.json(
            { errors: [{ message: 'repetições são obrigatórios' }] },
            { status: 400 }
          );
        }


        const workoutPlanId = parseInt(String(data.workoutPlanId), 10);
        const exerciseId = parseInt(String(data.exerciseId), 10);
        const sets = parseInt(String(data.sets), 10);
        const reps = parseInt(String(data.reps), 10);
        const restSeconds = parseInt(String(data.restSeconds), 10);
        
        // Create new diet plan
        const exerciseWorkoutData = {
          workout_plan: workoutPlanId,
          exercise: exerciseId,
          sets: sets,
          reps: reps,
          rest_seconds: restSeconds || null,
          notes: data.notes || null
        };

        // Search for existing the same ExerciseWorkout
        const existingExerciseWorkout = await req.payload.find({
          collection: 'exercise-workouts',
          where: {
            and: [
              {
                workout_plan: {
                  equals: workoutPlanId,
                },
              },
              {
                exercise: {
                  equals: exerciseId,
                },
              }
            ],
          },
          depth: 2,
        });

        console.log('Existing Exercise Workouts:', existingExerciseWorkout);

        if (existingExerciseWorkout.totalDocs > 0) {
          throw new Error('Treino de Exercício já cadastrado');
        }

        const exerciseWorkout = await req.payload.create({
          collection: 'exercise-workouts',
          data: exerciseWorkoutData
        });

        // Return response with created entities
        return Response.json(exerciseWorkout);
      } catch (error) {
        console.error('[TrainerApi][create-exercise-workouts]:', error);
        const errorMessage = error instanceof Error ? error.message : 'Erro inesperado ao criar exercício de treino';
        return Response.json({ errors: [{ message: errorMessage }] }, { status: 500 });
      }
    }
  },
  {
    method: 'put',
    path: '/exercise-workouts/:id',
    handler: async (req: PayloadRequest) => {
      try {
        const trainerId = await getLoggedInTrainerId(req);
        const exerciseWorkoutId = req.routeParams?.id;

        if (!exerciseWorkoutId) {
          return Response.json(
            { errors: [{ message: 'ID do exercício de treino é obrigatório' }] },
            { status: 400 }
          );
        }
        const exerciseWorkoutIdTransformed = parseInt(String(exerciseWorkoutId), 10);
        // Parse request body
        const data = await req.json?.();

        console.log('data exercise-workout update:', data);
        if (!data) {
          return Response.json(
            { errors: [{ message: 'Corpo da requisição inválido' }] },
            { status: 400 }
          );
        }

        // Verify the exercise workout exists and belongs to this trainer
        const exerciseWorkout = await req.payload.find({
          collection: 'exercise-workouts',
          where: {
            and: [
              {
                id: { equals: exerciseWorkoutIdTransformed }
              },
              {
                "workout_plan.trainer": { equals: trainerId }
              }
            ]
          },
          depth: 2
        });

        if (exerciseWorkout.totalDocs === 0) {
          return Response.json(
            { errors: [{ message: 'Exercício de treino não encontrado' }] },
            { status: 404 }
          );
        }
        const workoutPlanId = parseInt(String(data.workoutPlanId), 10);
        const exerciseId = parseInt(String(data.exerciseId), 10);
        const sets = parseInt(String(data.sets), 10);
        const reps = parseInt(String(data.reps), 10);
        const restSeconds = parseInt(String(data.restSeconds), 10);

        // Update the exercise Workout with the provided data
        const updateData = {
          ...(workoutPlanId && { workout_plan: workoutPlanId }),
          ...(exerciseId && { exercise: exerciseId }),
          ...(sets && { sets: sets }),
          ...(reps && { reps: reps }),
          ...(restSeconds && { rest_seconds: restSeconds }),
          ...(data.notes && { notes: data.notes }),
        };

        const updatedExerciseWorkout = await req.payload.update({
          collection: 'exercise-workouts',
          id: exerciseWorkoutIdTransformed,
          data: updateData
        });

        return Response.json({
          success: true,
          dietPlan: updatedExerciseWorkout
        });

      } catch (error) {
        console.error('[TrainerApi][update-exercise-workout]:', error);
        const errorMessage = error instanceof Error ? error.message : 'Erro inesperado ao atualizar exercício de treino';
        return Response.json({ errors: [{ message: errorMessage }] }, { status: 500 });
      }
    }
  },
  {
    method: 'get',
    path: '/exercises',
    handler: async (req) => {
      try {
        const { name, muscleGroup } = req.query;
        // list the exercises
        const exercises = await req.payload.find({
          collection: 'exercises',
          where: {
            and: [
              name ? {
                name: {
                  like: name,
                },
              } : {},
              muscleGroup ? {
                muscle_group: {
                  like: muscleGroup,
                },
              } : {}
            ],
          },
          depth: 2,
        });

        return Response.json(exercises)

      } catch (error) {
        console.error('[TrainerApi][exercise]:', error);
        return Response.json({
          errors: [{ message: 'Erro inesperado ao buscar exercicios.' }]
        }, { status: 500 })
      }
    }
  },
  {
    method: 'post',
    path: '/exercises',
    handler: async (req: PayloadRequest) => {
      try {
        const data = await req.json?.();


        if (!data.name) {
          throw new Error('Diet name is required');
        }

        const exerciseData = {
          name: data.name,
          ...(data.description && { description: data.description }),
          ...(data.muscleGroup && { muscle_group: data.muscleGroup }),
        };

        // Create the exercise
        const meal = await req.payload.create({
          collection: 'exercises',
          data: exerciseData,
        });

        return Response.json(meal);
      }
      catch (error) {
        console.error('[TrainerApi][create-exercise]:', error);
        const errorMessage = error instanceof Error ? error.message : 'Erro inesperado ao criar exercício';
        return Response.json({ errors: [{ message: errorMessage }] }, { status: 500 });
      }
    }
  },
  {
    method: 'put',
    path: '/exercises/:id',
    handler: async (req: PayloadRequest) => {
      try {
        const exerciseId = req.routeParams?.id;

        if (!exerciseId) {
          return Response.json(
            { errors: [{ message: 'ID do dia do exercício é obrigatório' }] },
            { status: 400 }
          );
        }

        const exerciseIdTransformed = parseInt(String(exerciseId), 10);

        // Parse request body
        const data = await req.json?.();

        console.log('data exercise update:', data);
        if (!data) {
          return Response.json(
            { errors: [{ message: 'Corpo da requisição inválido' }] },
            { status: 400 }
          );
        }

        // Verify the diet plan day exists and belongs to this trainer
        const exercise = await req.payload.find({
          collection: 'exercises',
          where: {
            and: [
              {
                id: { equals: exerciseIdTransformed }
              }
            ]
          },
          depth: 2
        });

        if (!exercise.docs || exercise.docs.length === 0) {
          return Response.json(
            { errors: [{ message: 'Exercício não encontrado' }] },
            { status: 404 }
          );
        }

        // Update the diet plan day with the provided data
        const updateExerciseData = {
          ...(data.name && { name: data.name }),
          ...(data.description && { description: data.description }),
          ...(data.muscleGroup && { muscle_group: data.muscleGroup }),
        };

        const updatedExercise = await req.payload.update({
          collection: 'exercises',
          id: exerciseIdTransformed,
          data: updateExerciseData
        });

        return Response.json({
          success: true,
          data: updatedExercise
        });

      } catch (error) {
        console.error('[TrainerApi][update-exercise]:', error);
        const errorMessage = error instanceof Error ? error.message : 'Erro inesperado ao atualizar exercício';
        return Response.json({ errors: [{ message: errorMessage }] }, { status: 500 });
      }
    }
  },
];
