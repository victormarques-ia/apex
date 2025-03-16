import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').N extConfig} */
const nextConfig = {
  output: 'standalone',
}

export default withPayload(nextConfig)
