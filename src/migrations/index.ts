import * as migration_20250202_232948_initial from './20250202_232948_initial';

export const migrations = [
  {
    up: migration_20250202_232948_initial.up,
    down: migration_20250202_232948_initial.down,
    name: '20250202_232948_initial'
  },
];
