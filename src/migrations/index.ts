import * as migration_20250202_232948_initial from './20250202_232948_initial';
import * as migration_20250224_134819_add_role_and_name_field_to_user from './20250224_134819_add_role_and_name_field_to_user';

export const migrations = [
  {
    up: migration_20250202_232948_initial.up,
    down: migration_20250202_232948_initial.down,
    name: '20250202_232948_initial',
  },
  {
    up: migration_20250224_134819_add_role_and_name_field_to_user.up,
    down: migration_20250224_134819_add_role_and_name_field_to_user.down,
    name: '20250224_134819_add_role_and_name_field_to_user'
  },
];
