/** @type {import('next').NextConfig} */

const nextConfig = {
  productionBrowserSourceMaps: true,
  images: {
    minimumCacheTTL: 60,
    remotePatterns: [
     {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'okrondev.blob.core.windows.net',
        port: '',
        pathname: '/**',
      },
    ],
  },
}


module.exports = nextConfig;