import payloadConfig from '@/payload.config'
import { getPayload } from 'payload'

const payloadInstance = await getPayload({
  config: payloadConfig,
})

export default payloadInstance
