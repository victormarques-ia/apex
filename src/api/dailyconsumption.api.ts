import { Endpoint, PayloadRequest } from 'payload'

export const DailyConsumptionApi: Endpoint[] = [
  {
    method: 'get',
    path: '/history',
    handler: async (req: PayloadRequest) => {
      try {
        const { from, to, athleteId, limit, page } = req.query;
        
        // Basic validation
        if (!athleteId) {
          return Response.json(
            {
              errors: [{ message: 'ID do atleta é obrigatório' }],
            },
            { status: 400 }
          );
        }

        if (!from) {
          const today = new Date();
          from = today.toISOString().split('T')[0];
        }

        // If to is not provided, use the from date (single day)
        if (!to) {
          to = from;
        }

        // Handle pagination parameters
        const parsedLimit = limit ? parseInt(limit as string, 10) : 50;
        const validLimit = !isNaN(parsedLimit) && parsedLimit > 0 && parsedLimit <= 500 
          ? parsedLimit 
          : 50; // Default limit
        
        // Build the where condition based on date range
        const whereCondition = {
          and: [
            {
              date: {
                greater_than_equal: from as string,
                less_than_equal: to as string,
              },
            },
            {
              athlete: {
                equals: parseInt(athleteId as string, 10),
              },
            },
          ],
        };

        // Find all consumptions in the date range for the athlete
        const consumptionsResult = await req.payload.find({
          collection: 'daily-consumption',
          where: whereCondition,
          depth: 1, // Include the food collection data
          limit: validLimit,
          page: page ? parseInt(page as string, 10) : undefined,
          sort: 'date', // Sort by date
        });

        return Response.json({
          consumptionsResult,
          dateRange: {
            from: from,
            to: to,
          },
        });

      } catch (error) {
        console.error('[DailyConsumptionApi][totals]:', error);
        return Response.json(
          {
            errors: [{ message: 'Erro inesperado ao obter totais de consumo' }],
          },
          { status: 500 }
        );
      }
    },
  },
];
