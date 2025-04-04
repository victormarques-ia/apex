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

        // Search for existing diet plans in the same date range
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
];
