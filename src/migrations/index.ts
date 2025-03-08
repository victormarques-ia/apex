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
import * as migration_20250302_181415_add_exerciseWorkouts from './20250302_181415_add_exerciseWorkouts';
import * as migration_20250302_181457_add_dietPlans from './20250302_181457_add_dietPlans';
import * as migration_20250302_181532_add_dietPlanDays from './20250302_181532_add_dietPlanDays';
import * as migration_20250306_191644_add_meal from './20250306_191644_add_meal';
import * as migration_20250306_192740_add_food from './20250306_192740_add_food';
import * as migration_20250306_194203_add_mealFood from './20250306_194203_add_mealFood';
import * as migration_20250306_194851_add_dailyConsumption from './20250306_194851_add_dailyConsumption';
import * as migration_20250306_195233_add_hydrationLog from './20250306_195233_add_hydrationLog';
import * as migration_20250308_215935_add_reports_nutritionits_feedback_agencyprofessional from './20250308_215935_add_reports_nutritionits_feedback_agencyprofessional';

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
    name: '20250302_181302_add_exercises',
  },
  {
    up: migration_20250302_181415_add_exerciseWorkouts.up,
    down: migration_20250302_181415_add_exerciseWorkouts.down,
    name: '20250302_181415_add_exerciseWorkouts',
  },
  {
    up: migration_20250302_181457_add_dietPlans.up,
    down: migration_20250302_181457_add_dietPlans.down,
    name: '20250302_181457_add_dietPlans',
  },
  {
    up: migration_20250302_181532_add_dietPlanDays.up,
    down: migration_20250302_181532_add_dietPlanDays.down,
    name: '20250302_181532_add_dietPlanDays',
  },
  {
    up: migration_20250306_191644_add_meal.up,
    down: migration_20250306_191644_add_meal.down,
    name: '20250306_191644_add_meal',
  },
  {
    up: migration_20250306_192740_add_food.up,
    down: migration_20250306_192740_add_food.down,
    name: '20250306_192740_add_food',
  },
  {
    up: migration_20250306_194203_add_mealFood.up,
    down: migration_20250306_194203_add_mealFood.down,
    name: '20250306_194203_add_mealFood',
  },
  {
    up: migration_20250306_194851_add_dailyConsumption.up,
    down: migration_20250306_194851_add_dailyConsumption.down,
    name: '20250306_194851_add_dailyConsumption',
  },
  {
    up: migration_20250306_195233_add_hydrationLog.up,
    down: migration_20250306_195233_add_hydrationLog.down,
    name: '20250306_195233_add_hydrationLog',
  },
  {
    up: migration_20250308_215935_add_reports_nutritionits_feedback_agencyprofessional.up,
    down: migration_20250308_215935_add_reports_nutritionits_feedback_agencyprofessional.down,
    name: '20250308_215935_add_reports_nutritionits_feedback_agencyprofessional'
  },
];
