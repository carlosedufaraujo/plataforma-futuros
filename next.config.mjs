/** @type {import('next').NextConfig} */

// Debug: Imprimir variáveis durante o build
console.log('🔧 Next.js Config - Variáveis de Ambiente:');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET');

const nextConfig = {
  // Configuração MINIMALISTA - apenas o essencial
  
  // Experimental - desabilitar funcionalidades que podem causar conflito
  experimental: {
    appDir: true,
  },
  
  // Configurações de imagem
  images: {
    unoptimized: true,
  },
  
  // Configurações de produção
  poweredByHeader: false,
  compress: true,
  
  // Desabilitar checagem de tipos no build para desenvolvimento
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;