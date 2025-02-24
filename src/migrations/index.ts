import * as migration_20250202_232948_initial from './20250202_232948_initial';
import * as migration_20250224_133802_add_role_user from './20250224_133802_add_role_user';

export const migrations = [
  {
    up: migration_20250202_232948_initial.up,
    down: migration_20250202_232948_initial.down,
    name: '20250202_232948_initial',
  },
  {
    up: migration_20250224_133802_add_role_user.up,
    down: migration_20250224_133802_add_role_user.down,
    name: '20250224_133802_add_role_user'
  },
];
