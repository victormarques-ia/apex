import { Endpoint, PayloadRequest } from 'payload'

export const NutritionistApi: Endpoint[] = [
  {
    method: 'get',
    path: '/patients',
    handler: async (req: PayloadRequest) => {
      try {
        // Verifica se o usuário está autenticado
        if (!req.user) {
          return Response.json(
            {
              errors: [{ message: 'Usuário não autenticado' }],
            },
            { status: 401 }
          );
        }

        const userId = req.user.id;

        // Encontra o perfil de nutricionista associado ao usuário autenticado
        const nutritionistProfiles = await req.payload.find({
          collection: 'nutritionists',
          where: {
            user: {
              equals: userId,
            },
          },
          limit: 1,
        });

        // Verifica se o perfil de nutricionista existe
        if (!nutritionistProfiles.docs || nutritionistProfiles.docs.length === 0) {
          return Response.json(
            {
              errors: [{ message: 'Perfil de nutricionista não encontrado para este usuário' }],
            },
            { status: 404 }
          );
        }

        const nutritionistId = nutritionistProfiles.docs[0].id;

        // Busca todos os relacionamentos nutricionista-atleta para este nutricionista
        const nutritionistAthletes = await req.payload.find({
          collection: 'nutritionist-athletes',
          where: {
            nutritionist: {
              equals: nutritionistId,
            },
          },
          depth: 2, // Inclui dados relacionados, como informações completas dos atletas
        });

        // Extrai apenas os perfis de atletas da lista de relacionamentos
        const patients = nutritionistAthletes.docs.map(relation => relation.athlete);

        return Response.json({
          data: {
            total: nutritionistAthletes.totalDocs,
            patients: patients,
          },
        });

      } catch (error) {
        console.error('[NutritionistApi][patients]:', error);
        return Response.json(
          {
            errors: [{ message: 'Erro inesperado ao buscar pacientes do nutricionista' }],
          },
          { status: 500 }
        );
      }
    },
  },
];