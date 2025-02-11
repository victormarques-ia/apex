import BaseService from './base.service'
import { User } from 'payload'

class UserService extends BaseService {
  async getUsers() {
    const users = await this.find<User>({
      collection: 'users',
    })

    return users
  }
}

export const userService = new UserService()

export default UserService
