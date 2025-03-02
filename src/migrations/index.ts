import * as migration_20250202_232948_initial from './20250202_232948_initial';
import * as migration_20250224_134819_add_role_and_name_field_to_user from './20250224_134819_add_role_and_name_field_to_user';
import * as migration_20250228_170337_name_add_trainers from './20250228_170337_name_add_trainers';
import * as migration_20250228_171018_name_add_agencies from './20250228_171018_name_add_agencies';
import * as migration_20250228_180503_name_add_nutritionists from './20250228_180503_name_add_nutritionists';
import * as migration_20250228_180657_name_add_athleteProfiles from './20250228_180657_name_add_athleteProfiles';
import * as migration_20250302_180344_add_workoutPlans from './20250302_180344_add_workoutPlans';
import * as migration_20250302_180921_add_trainerAthletes from './20250302_180921_add_trainerAthletes';
import * as migration_20250302_181118_add_physicalActivityLogs from './20250302_181118_add_physicalActivityLogs';
import * as migration_20250302_181302_add_exercises from './20250302_181302_add_exercises';

export const migrations = [
  {
    up: migration_20250202_232948_initial.up,
    down: migration_20250202_232948_initial.down,
    name: '20250202_232948_initial',
  },
  {
    up: migration_20250224_134819_add_role_and_name_field_to_user.up,
    down: migration_20250224_134819_add_role_and_name_field_to_user.down,
    name: '20250224_134819_add_role_and_name_field_to_user',
  },
  {
    up: migration_20250228_170337_name_add_trainers.up,
    down: migration_20250228_170337_name_add_trainers.down,
    name: '20250228_170337_name_add_trainers',
  },
  {
    up: migration_20250228_171018_name_add_agencies.up,
    down: migration_20250228_171018_name_add_agencies.down,
    name: '20250228_171018_name_add_agencies',
  },
  {
    up: migration_20250228_180503_name_add_nutritionists.up,
    down: migration_20250228_180503_name_add_nutritionists.down,
    name: '20250228_180503_name_add_nutritionists',
  },
  {
    up: migration_20250228_180657_name_add_athleteProfiles.up,
    down: migration_20250228_180657_name_add_athleteProfiles.down,
    name: '20250228_180657_name_add_athleteProfiles',
  },
  {
    up: migration_20250302_180344_add_workoutPlans.up,
    down: migration_20250302_180344_add_workoutPlans.down,
    name: '20250302_180344_add_workoutPlans',
  },
  {
    up: migration_20250302_180921_add_trainerAthletes.up,
    down: migration_20250302_180921_add_trainerAthletes.down,
    name: '20250302_180921_add_trainerAthletes',
  },
  {
    up: migration_20250302_181118_add_physicalActivityLogs.up,
    down: migration_20250302_181118_add_physicalActivityLogs.down,
    name: '20250302_181118_add_physicalActivityLogs',
  },
  {
    up: migration_20250302_181302_add_exercises.up,
    down: migration_20250302_181302_add_exercises.down,
    name: '20250302_181302_add_exercises'
  },
];
