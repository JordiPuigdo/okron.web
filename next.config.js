/** @type {import('next').NextConfig} */

const nextConfig = {
  productionBrowserSourceMaps: true,
  env: {
    NEXT_PUBLIC_BUILD_VERSION: Date.now().toString(),
  },
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