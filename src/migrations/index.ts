import * as migration_20250202_232948_initial from './20250202_232948_initial';
import * as migration_20250224_134819_add_role_and_name_field_to_user from './20250224_134819_add_role_and_name_field_to_user';
import * as migration_20250228_170337_name_add_trainers from './20250228_170337_name_add_trainers';
import * as migration_20250228_171018_name_add_agencies from './20250228_171018_name_add_agencies';
import * as migration_20250228_180503_name_add_nutritionists from './20250228_180503_name_add_nutritionists';
import * as migration_20250228_180657_name_add_athleteProfiles from './20250228_180657_name_add_athleteProfiles';

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
    name: '20250228_180657_name_add_athleteProfiles'
  },
];
