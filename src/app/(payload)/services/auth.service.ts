import BaseService from './base.service'

class AuthService extends BaseService {
  async login(email: string, password: string) {
    try {
      const { user, token } = await this.payload.login({
        collection: 'users',
        data: {
          email: email,
          password: password,
        },
        overrideAccess: false,
      })

      return { user, token }
    } catch (error) {
      console.error(error)
      return { user: null, token: null }
    }
  }
}

export const authService = new AuthService()

export default AuthService
