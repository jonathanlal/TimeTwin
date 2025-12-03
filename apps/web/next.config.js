const path = require('path')
const dotenv = require('dotenv')

dotenv.config({
  path: path.join(__dirname, '..', '..', '.env'),
  override: true,
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@timetwin/api-sdk'],
  typescript: {
    // Temporarily ignore build errors - React 19 type incompatibilities with packages using React 18
    ignoreBuildErrors: true,
  },
  turbopack: {
    // Turbopack was picking C:\Users\Zippy (because of another lockfile) as the repo root.
    // Point it to the actual monorepo root so Tailwind/PostCSS resolve modules correctly.
    root: path.join(__dirname, '..', '..'),
  },
}

module.exports = nextConfig
