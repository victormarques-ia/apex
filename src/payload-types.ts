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