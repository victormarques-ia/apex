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
      console.error(`[AuthService][login]: ${error}`)
      return { user: null, token: null }
    }
  }
}

export default AuthService
