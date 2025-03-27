import type { CollectionConfig } from "payload";
import { DailyConsumptionApi } from "@/api/dailyconsumption.api";

export const DailyConsumption: CollectionConfig = {
    slug: 'daily-consumption',
    admin: {
      useAsTitle: 'date'
    },
    fields: [
      {
        name: 'athlete',
        type: 'relationship',
        relationTo: 'athlete-profiles',
        required: false
      },
      {
        name: 'food',
        type: 'relationship',
        relationTo: 'food',
        required: false
      },
      {
        name: 'date',
        type: 'date',
        required: true
      },
      {
        name: 'quantity_grams',
        type: 'number',
        required: true
      }
    ],
    endpoints: DailyConsumptionApi,
  }
