/** @type {import('next').NextConfig} */

// Debug: Imprimir variáveis durante o build
console.log('🔧 Next.js Config - Variáveis de Ambiente:');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET');

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
  // Headers de segurança
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https:",
              "connect-src 'self' https://kdfevkbwohcajcwrqzor.supabase.co wss://kdfevkbwohcajcwrqzor.supabase.co https://boi-gordo-mcp-official.carlosedufaraujo.workers.dev",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'"
            ].join('; ')
          },
        ],
      },
    ];
  },
  // Variáveis de ambiente - FORÇAR valores se não existirem
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    NEXT_PUBLIC_MCP_URL: process.env.NEXT_PUBLIC_MCP_URL || 'https://boi-gordo-mcp-official.carlosedufaraujo.workers.dev',
    NEXT_PUBLIC_MCP_TOKEN: process.env.NEXT_PUBLIC_MCP_TOKEN || 'development-token',
    // Adicionar Supabase explicitamente
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kdfevkbwohcajcwrqzor.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkZmV2a2J3b2hjYWpjd3Jxem9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMTUzODcsImV4cCI6MjA2ODg5MTM4N30.4nBjKi3rdpfbYmxeoa8GELdBLq8JY6ym68cJX7jpaus',
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