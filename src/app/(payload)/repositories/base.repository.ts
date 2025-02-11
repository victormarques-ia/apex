import payloadInstance from '@/payload.instance'

class BaseRepository {
  payload() {
    return payloadInstance
  }
}

export default BaseRepository
