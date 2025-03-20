import AuthService from './(payload)/services/auth.service'
import UserService from './(payload)/services/users.service'
import DailyConsumptionService from './(payload)/services/daily-consumption.service'

class DI {
  private static instance: DI

  public userService: UserService
  public authService: AuthService
  public dailyConsumptionService: DailyConsumptionService

  private constructor() {
    this.userService = new UserService()
    this.authService = new AuthService()
    this.dailyConsumptionService = new DailyConsumptionService()
  }

  public static getInstance(): DI {
    if (!DI.instance) {
      DI.instance = new DI()
    }
    return DI.instance
  }
}

export const di = DI.getInstance()