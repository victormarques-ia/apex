import payloadInstance from '@/payload.instance'
import { CollectionSlug, PaginatedDocs } from 'payload'
import { headers as getHeaders } from 'next/headers.js'

class BaseService {
  async find<T>({ collection }: { collection: CollectionSlug }) {
    try {
      const result = await this.payload.find({
        collection,
        overrideAccess: false,
        req: await this.req(),
      })

      return result as PaginatedDocs<T>
    } catch (error) {
      console.error(`[BaseService][find]: `, error)
      return
    }
  }

  async findById({ collection, id }: { collection: CollectionSlug; id: string }) {
    try {
      const result = await this.payload.findByID({
        collection,
        id,
        overrideAccess: false,
        req: await this.req(),
      })

      return result
    } catch (error) {
      console.error(`[BaseService][findById]: `, error)

      return
    }
  }

  async create({
    collection,
    data,
  }: {
    collection: CollectionSlug
    data: Record<string, unknown>
  }) {
    try {
      const result = await this.payload.create({
        collection,
        data,
        overrideAccess: false,
        req: await this.req(),
      })

      return result
    } catch (error) {
      console.error(`[BaseService][create]: `, error)
      return
    }
  }

  get payload() {
    return payloadInstance
  }

  private async req() {
    const headers = await getHeaders()
    const { user } = await this.payload.auth({ headers })
    return {
      headers,
      user,
    }
  }
}

export default BaseService
