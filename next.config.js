/** @type {import('next').NextConfig} */

const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: '(?<client>kolder|jpont).okron.com',
          },
        ],
        destination: '/:path*',
      },
    ]
  },
}

module.exports = nextConfig