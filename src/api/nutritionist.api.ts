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
        limit: 1,
    });

    if (!nutritionistProfiles.docs || nutritionistProfiles.docs.length === 0) {
        throw new Error('Perfil de nutricionista não encontrado para este usuário');
    }

    return nutritionistProfiles.docs[0].id;
}

export const NutritionistApi: Endpoint[] = [
  {
    method: 'get',
    path: '/my-athletes',
    handler: async (req: PayloadRequest) => {
      try {
        const nutritionistId = await getLoggedInNutritionistId(req);

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
];