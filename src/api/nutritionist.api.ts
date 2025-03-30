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
        const name = req.query.name as string || "";
        const sortOrder = req.query.sortOrder as string || "asc";
        // Você pode ordenar por nome, data da ultima atualizacao e meta.
        // Exemplo: athlete.user.name, athlete.updatedAt, athlete.goal
        const sortFields = [ 'athlete.user.name', 'athlete.updatedAt', 'athlete.goal' ];
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
];