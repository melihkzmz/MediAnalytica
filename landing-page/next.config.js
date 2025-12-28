/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  distDir: '.next',
  output: 'standalone',
}

module.exports = nextConfig

