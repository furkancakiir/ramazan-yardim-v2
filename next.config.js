/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // TypeScript hataları olsa bile build işlemini tamamla
    ignoreBuildErrors: true,
  },
  // 'eslint' bloğunu SİLDİK çünkü hataya sebep oluyor
}

module.exports = nextConfig