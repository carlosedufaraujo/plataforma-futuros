/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configurações para Cloudflare Pages
  output: 'export',
  trailingSlash: true, // Importante para Cloudflare Pages
  images: {
    unoptimized: true,
  },
  // Configurações de produção
  poweredByHeader: false,
  compress: true,
  // Variáveis de ambiente
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    NEXT_PUBLIC_MCP_URL: process.env.NEXT_PUBLIC_MCP_URL || '',
    NEXT_PUBLIC_MCP_TOKEN: process.env.NEXT_PUBLIC_MCP_TOKEN || '',
  },
  // Desabilitar checagem de tipos no build
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;