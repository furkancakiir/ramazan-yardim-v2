/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // TypeScript hataları olsa bile build işlemini tamamla
    ignoreBuildErrors: true,
  },
  eslint: {
    // ESLint hataları olsa bile build işlemini tamamla
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig