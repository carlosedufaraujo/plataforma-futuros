/** @type {import('next').NextConfig} */

// Debug: Imprimir variáveis durante o build
console.log('🔧 Next.js Config - Variáveis de Ambiente:');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET');

// Detectar se é build para Cloudflare
const isCloudflarePages = process.env.CF_PAGES === '1' || process.env.CF_PAGES_BRANCH;
const isCloudflareBuild = process.env.ESLINT_CONFIG_FILE === '.eslintrc.prod.json';

console.log('🔍 Build Environment:');
console.log('CF_PAGES:', process.env.CF_PAGES);
console.log('CF_PAGES_BRANCH:', process.env.CF_PAGES_BRANCH);
console.log('ESLINT_CONFIG_FILE:', process.env.ESLINT_CONFIG_FILE);
console.log('Is Cloudflare Build:', isCloudflarePages || isCloudflareBuild);

const nextConfig = {
  // Configuração MINIMALISTA - apenas o essencial
  
  // Remover experimental.appDir - não é mais necessário no Next.js 14
  
  // Output para Cloudflare Pages (somente quando necessário)
  ...(isCloudflarePages || isCloudflareBuild ? {
    output: 'export',
    trailingSlash: true,
    distDir: 'out'
  } : {}),
  
  // Configurações de imagem
  images: {
    unoptimized: true,
  },
  
  // Configurações de produção
  poweredByHeader: false,
  compress: true,
  
  // Habilitar checagem de tipos e linting
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

console.log('📋 Next.js Config Final:', {
  output: nextConfig.output,
  trailingSlash: nextConfig.trailingSlash,
  distDir: nextConfig.distDir
});

export default nextConfig;