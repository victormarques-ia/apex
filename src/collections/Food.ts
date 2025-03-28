import type { CollectionConfig } from "payload";
import { FoodApi } from "@/api/food.api";

export const Food: CollectionConfig = {
    slug: 'food',
    admin: {
      useAsTitle: 'name',
    },
    fields: [
      {
        name: 'name',
        type: 'text',
        required: true,
        maxLength: 255,
      },
      {
        name: 'calories_per_100g',
        type: 'number',
        required: false,
      },
      {
        name: 'protein_per_100g',
        type: 'number',
        required: false,
      },
      {
        name: 'carbs_per_100g',
        type: 'number',
        required: false,
      },
      {
        name: 'fat_per_100g',
        type: 'number',
        required: false,
      }
    ],
    endpoints: FoodApi,
  }
