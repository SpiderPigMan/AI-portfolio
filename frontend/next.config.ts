import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. Mejora el rendimiento de las imágenes (por si usas fotos de GitHub o LinkedIn)
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'github.com' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'media.licdn.com' }, // Para fotos de LinkedIn
    ],
  },

  // 2. Configuración de producción para despliegues eficientes
  output: 'standalone', 

  // 3. Proxy para el Backend
  // Esto permite llamar a "/api/chat" desde el frontend en lugar de la URL larga de Render
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
      },
    ];
  },

  // 4. Habilita el modo estricto para detectar errores en desarrollo
  reactStrictMode: true,

  // 5. Limpieza de logs en producción para mayor seguridad
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};

export default nextConfig;