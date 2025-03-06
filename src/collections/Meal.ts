import type { CollectionConfig } from "payload";

export const Meal: CollectionConfig = {
    slug: 'meal',
    admin: {
      useAsTitle: 'meal_type',
    },
    fields: [
      {
        name: 'diet_plan_day',
        type: 'relationship',
        relationTo: 'diet-plan-days',
        required: true,
      },
      {
        name: 'meal_type',
        type: 'text',
        required: true,
        maxLength: 50,
      },
      {
        name: 'scheduled_time',
        type: 'date',
        admin: {
            date: {
                pickerAppearance: 'timeOnly', 
            },
        },
        required: false,
      },
      {
        name: 'order_index',
        type: 'number',
        required: false,
      }
    ],
  }