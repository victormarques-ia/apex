/* tslint:disable */
/* eslint-disable */
/**
 * This file was automatically generated by Payload.
 * DO NOT MODIFY IT BY HAND. Instead, modify your source Payload config,
 * and re-run `payload generate:types` to regenerate this file.
 */

export interface Config {
  auth: {
    users: UserAuthOperations;
  };
  collections: {
    users: User;
    media: Media;
    trainers: Trainer;
    agencies: Agency;
    nutritionists: Nutritionist;
    'athlete-profiles': AthleteProfile;
    'workout-plans': WorkoutPlan;
    'trainer-athletes': TrainerAthlete;
    'physical-activity-logs': PhysicalActivityLog;
    exercises: Exercise;
    'exercise-workouts': ExerciseWorkout;
    'diet-plans': DietPlan;
    'diet-plan-days': DietPlanDay;
    meal: Meal;
    food: Food;
    'meal-food': MealFood;
    'payload-locked-documents': PayloadLockedDocument;
    'payload-preferences': PayloadPreference;
    'payload-migrations': PayloadMigration;
  };
  collectionsJoins: {};
  collectionsSelect: {
    users: UsersSelect<false> | UsersSelect<true>;
    media: MediaSelect<false> | MediaSelect<true>;
    trainers: TrainersSelect<false> | TrainersSelect<true>;
    agencies: AgenciesSelect<false> | AgenciesSelect<true>;
    nutritionists: NutritionistsSelect<false> | NutritionistsSelect<true>;
    'athlete-profiles': AthleteProfilesSelect<false> | AthleteProfilesSelect<true>;
    'workout-plans': WorkoutPlansSelect<false> | WorkoutPlansSelect<true>;
    'trainer-athletes': TrainerAthletesSelect<false> | TrainerAthletesSelect<true>;
    'physical-activity-logs': PhysicalActivityLogsSelect<false> | PhysicalActivityLogsSelect<true>;
    exercises: ExercisesSelect<false> | ExercisesSelect<true>;
    'exercise-workouts': ExerciseWorkoutsSelect<false> | ExerciseWorkoutsSelect<true>;
    'diet-plans': DietPlansSelect<false> | DietPlansSelect<true>;
    'diet-plan-days': DietPlanDaysSelect<false> | DietPlanDaysSelect<true>;
    meal: MealSelect<false> | MealSelect<true>;
    food: FoodSelect<false> | FoodSelect<true>;
    'meal-food': MealFoodSelect<false> | MealFoodSelect<true>;
    'payload-locked-documents': PayloadLockedDocumentsSelect<false> | PayloadLockedDocumentsSelect<true>;
    'payload-preferences': PayloadPreferencesSelect<false> | PayloadPreferencesSelect<true>;
    'payload-migrations': PayloadMigrationsSelect<false> | PayloadMigrationsSelect<true>;
  };
  db: {
    defaultIDType: number;
  };
  globals: {};
  globalsSelect: {};
  locale: null;
  user: User & {
    collection: 'users';
  };
  jobs: {
    tasks: unknown;
    workflows: unknown;
  };
}
export interface UserAuthOperations {
  forgotPassword: {
    email: string;
    password: string;
  };
  login: {
    email: string;
    password: string;
  };
  registerFirstUser: {
    email: string;
    password: string;
  };
  unlock: {
    email: string;
    password: string;
  };
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "users".
 */
export interface User {
  id: number;
  role: 'athlete' | 'nutritionist' | 'trainer' | 'agency';
  name: string;
  updatedAt: string;
  createdAt: string;
  email: string;
  resetPasswordToken?: string | null;
  resetPasswordExpiration?: string | null;
  salt?: string | null;
  hash?: string | null;
  loginAttempts?: number | null;
  lockUntil?: string | null;
  password?: string | null;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "media".
 */
export interface Media {
  id: number;
  alt: string;
  updatedAt: string;
  createdAt: string;
  url?: string | null;
  thumbnailURL?: string | null;
  filename?: string | null;
  mimeType?: string | null;
  filesize?: number | null;
  width?: number | null;
  height?: number | null;
  focalX?: number | null;
  focalY?: number | null;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "trainers".
 */
export interface Trainer {
  id: number;
  user: number | User;
  certification?: string | null;
  specialization?: string | null;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "agencies".
 */
export interface Agency {
  id: number;
  user: number | User;
  name: string;
  contact_info?: string | null;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "nutritionists".
 */
export interface Nutritionist {
  id: number;
  user: number | User;
  license_number?: string | null;
  specialization?: string | null;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "athlete-profiles".
 */
export interface AthleteProfile {
  id: number;
  agency: number | Agency;
  user: number | User;
  weight?: number | null;
  height?: number | null;
  dietary_habits?: string | null;
  physical_activity_habits?: string | null;
  birth_date?: string | null;
  gender?: string | null;
  goal?: string | null;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "workout-plans".
 */
export interface WorkoutPlan {
  id: number;
  athlete?: (number | null) | AthleteProfile;
  trainer?: (number | null) | Trainer;
  start_date: string;
  end_date: string;
  goal?: string | null;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "trainer-athletes".
 */
export interface TrainerAthlete {
  id: number;
  trainer: number | Trainer;
  athlete: number | AthleteProfile;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "physical-activity-logs".
 */
export interface PhysicalActivityLog {
  id: number;
  athlete: number | AthleteProfile;
  workout_plan?: (number | null) | WorkoutPlan;
  date: string;
  duration_minutes: number;
  calories_burned?: number | null;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "exercises".
 */
export interface Exercise {
  id: number;
  name: string;
  description?: string | null;
  muscle_group?: string | null;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "exercise-workouts".
 */
export interface ExerciseWorkout {
  id: number;
  workout_plan: number | WorkoutPlan;
  exercise: number | Exercise;
  sets: number;
  reps: number;
  rest_seconds?: number | null;
  notes?: string | null;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "diet-plans".
 */
export interface DietPlan {
  id: number;
  athlete: number | AthleteProfile;
  nutritionist: number | Nutritionist;
  start_date: string;
  end_date: string;
  total_daily_calories?: number | null;
  notes?: string | null;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "diet-plan-days".
 */
export interface DietPlanDay {
  id: number;
  diet_plan: number | DietPlan;
  date: string;
  day_of_week?: string | null;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "meal".
 */
export interface Meal {
  id: number;
  diet_plan_day: number | DietPlanDay;
  meal_type: string;
  scheduled_time?: string | null;
  order_index?: number | null;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "food".
 */
export interface Food {
  id: number;
  name: string;
  calories_per_100g?: number | null;
  protein_per_100g?: number | null;
  carbs_per_100g?: number | null;
  fat_per_100g?: number | null;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "meal-food".
 */
export interface MealFood {
  id: number;
  meal: number | Meal;
  food: number | Food;
  quantity_grams: number;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "payload-locked-documents".
 */
export interface PayloadLockedDocument {
  id: number;
  document?:
    | ({
        relationTo: 'users';
        value: number | User;
      } | null)
    | ({
        relationTo: 'media';
        value: number | Media;
      } | null)
    | ({
        relationTo: 'trainers';
        value: number | Trainer;
      } | null)
    | ({
        relationTo: 'agencies';
        value: number | Agency;
      } | null)
    | ({
        relationTo: 'nutritionists';
        value: number | Nutritionist;
      } | null)
    | ({
        relationTo: 'athlete-profiles';
        value: number | AthleteProfile;
      } | null)
    | ({
        relationTo: 'workout-plans';
        value: number | WorkoutPlan;
      } | null)
    | ({
        relationTo: 'trainer-athletes';
        value: number | TrainerAthlete;
      } | null)
    | ({
        relationTo: 'physical-activity-logs';
        value: number | PhysicalActivityLog;
      } | null)
    | ({
        relationTo: 'exercises';
        value: number | Exercise;
      } | null)
    | ({
        relationTo: 'exercise-workouts';
        value: number | ExerciseWorkout;
      } | null)
    | ({
        relationTo: 'diet-plans';
        value: number | DietPlan;
      } | null)
    | ({
        relationTo: 'diet-plan-days';
        value: number | DietPlanDay;
      } | null)
    | ({
        relationTo: 'meal';
        value: number | Meal;
      } | null)
    | ({
        relationTo: 'food';
        value: number | Food;
      } | null)
    | ({
        relationTo: 'meal-food';
        value: number | MealFood;
      } | null);
  globalSlug?: string | null;
  user: {
    relationTo: 'users';
    value: number | User;
  };
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "payload-preferences".
 */
export interface PayloadPreference {
  id: number;
  user: {
    relationTo: 'users';
    value: number | User;
  };
  key?: string | null;
  value?:
    | {
        [k: string]: unknown;
      }
    | unknown[]
    | string
    | number
    | boolean
    | null;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "payload-migrations".
 */
export interface PayloadMigration {
  id: number;
  name?: string | null;
  batch?: number | null;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "users_select".
 */
export interface UsersSelect<T extends boolean = true> {
  role?: T;
  name?: T;
  updatedAt?: T;
  createdAt?: T;
  email?: T;
  resetPasswordToken?: T;
  resetPasswordExpiration?: T;
  salt?: T;
  hash?: T;
  loginAttempts?: T;
  lockUntil?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "media_select".
 */
export interface MediaSelect<T extends boolean = true> {
  alt?: T;
  updatedAt?: T;
  createdAt?: T;
  url?: T;
  thumbnailURL?: T;
  filename?: T;
  mimeType?: T;
  filesize?: T;
  width?: T;
  height?: T;
  focalX?: T;
  focalY?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "trainers_select".
 */
export interface TrainersSelect<T extends boolean = true> {
  user?: T;
  certification?: T;
  specialization?: T;
  updatedAt?: T;
  createdAt?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "agencies_select".
 */
export interface AgenciesSelect<T extends boolean = true> {
  user?: T;
  name?: T;
  contact_info?: T;
  updatedAt?: T;
  createdAt?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "nutritionists_select".
 */
export interface NutritionistsSelect<T extends boolean = true> {
  user?: T;
  license_number?: T;
  specialization?: T;
  updatedAt?: T;
  createdAt?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "athlete-profiles_select".
 */
export interface AthleteProfilesSelect<T extends boolean = true> {
  agency?: T;
  user?: T;
  weight?: T;
  height?: T;
  dietary_habits?: T;
  physical_activity_habits?: T;
  birth_date?: T;
  gender?: T;
  goal?: T;
  updatedAt?: T;
  createdAt?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "workout-plans_select".
 */
export interface WorkoutPlansSelect<T extends boolean = true> {
  athlete?: T;
  trainer?: T;
  start_date?: T;
  end_date?: T;
  goal?: T;
  updatedAt?: T;
  createdAt?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "trainer-athletes_select".
 */
export interface TrainerAthletesSelect<T extends boolean = true> {
  trainer?: T;
  athlete?: T;
  updatedAt?: T;
  createdAt?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "physical-activity-logs_select".
 */
export interface PhysicalActivityLogsSelect<T extends boolean = true> {
  athlete?: T;
  workout_plan?: T;
  date?: T;
  duration_minutes?: T;
  calories_burned?: T;
  updatedAt?: T;
  createdAt?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "exercises_select".
 */
export interface ExercisesSelect<T extends boolean = true> {
  name?: T;
  description?: T;
  muscle_group?: T;
  updatedAt?: T;
  createdAt?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "exercise-workouts_select".
 */
export interface ExerciseWorkoutsSelect<T extends boolean = true> {
  workout_plan?: T;
  exercise?: T;
  sets?: T;
  reps?: T;
  rest_seconds?: T;
  notes?: T;
  updatedAt?: T;
  createdAt?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "diet-plans_select".
 */
export interface DietPlansSelect<T extends boolean = true> {
  athlete?: T;
  nutritionist?: T;
  start_date?: T;
  end_date?: T;
  total_daily_calories?: T;
  notes?: T;
  updatedAt?: T;
  createdAt?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "diet-plan-days_select".
 */
export interface DietPlanDaysSelect<T extends boolean = true> {
  diet_plan?: T;
  date?: T;
  day_of_week?: T;
  updatedAt?: T;
  createdAt?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "meal_select".
 */
export interface MealSelect<T extends boolean = true> {
  diet_plan_day?: T;
  meal_type?: T;
  scheduled_time?: T;
  order_index?: T;
  updatedAt?: T;
  createdAt?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "food_select".
 */
export interface FoodSelect<T extends boolean = true> {
  name?: T;
  calories_per_100g?: T;
  protein_per_100g?: T;
  carbs_per_100g?: T;
  fat_per_100g?: T;
  updatedAt?: T;
  createdAt?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "meal-food_select".
 */
export interface MealFoodSelect<T extends boolean = true> {
  meal?: T;
  food?: T;
  quantity_grams?: T;
  updatedAt?: T;
  createdAt?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "payload-locked-documents_select".
 */
export interface PayloadLockedDocumentsSelect<T extends boolean = true> {
  document?: T;
  globalSlug?: T;
  user?: T;
  updatedAt?: T;
  createdAt?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "payload-preferences_select".
 */
export interface PayloadPreferencesSelect<T extends boolean = true> {
  user?: T;
  key?: T;
  value?: T;
  updatedAt?: T;
  createdAt?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "payload-migrations_select".
 */
export interface PayloadMigrationsSelect<T extends boolean = true> {
  name?: T;
  batch?: T;
  updatedAt?: T;
  createdAt?: T;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "auth".
 */
export interface Auth {
  [k: string]: unknown;
}


declare module 'payload' {
  export interface GeneratedTypes extends Config {}
}