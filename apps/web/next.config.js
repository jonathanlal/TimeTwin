/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@timetwin/api-sdk'],
  typescript: {
    // ⚠️ Temporarily ignore build errors - React 19 type incompatibilities with packages using React 18
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
