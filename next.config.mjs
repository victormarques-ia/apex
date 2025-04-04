import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').N extConfig} */
const nextConfig = {
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default withPayload(nextConfig)
