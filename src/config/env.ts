// Configuração de ambiente centralizada
// Este arquivo garante que as variáveis estejam sempre disponíveis

interface EnvConfig {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  NEXT_PUBLIC_API_URL: string;
  NEXT_PUBLIC_MCP_URL: string;
  NEXT_PUBLIC_MCP_TOKEN: string;
  NEXT_PUBLIC_WS_URL: string;
}

// Valores padrão de produção
const defaultConfig: EnvConfig = {
  NEXT_PUBLIC_SUPABASE_URL: 'https://kdfevkbwohcajcwrqzor.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkZmV2a2J3b2hjYWpjd3Jxem9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMTUzODcsImV4cCI6MjA2ODg5MTM4N30.4nBjKi3rdpfbYmxeoa8GELdBLq8JY6ym68cJX7jpaus',
  NEXT_PUBLIC_API_URL: 'https://api.plataforma-futuros.com.br',
  NEXT_PUBLIC_MCP_URL: 'https://boi-gordo-mcp-official.carlosedufaraujo.workers.dev',
  NEXT_PUBLIC_MCP_TOKEN: 'production-token',
  NEXT_PUBLIC_WS_URL: 'wss://api.plataforma-futuros.com.br',
};

// Função para obter configuração
export function getEnvConfig(): EnvConfig {
  // Tentar usar variáveis de ambiente primeiro
  const config: EnvConfig = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || defaultConfig.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || defaultConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || defaultConfig.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_MCP_URL: process.env.NEXT_PUBLIC_MCP_URL || defaultConfig.NEXT_PUBLIC_MCP_URL,
    NEXT_PUBLIC_MCP_TOKEN: process.env.NEXT_PUBLIC_MCP_TOKEN || defaultConfig.NEXT_PUBLIC_MCP_TOKEN,
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || defaultConfig.NEXT_PUBLIC_WS_URL,
  };

  // Log apenas em desenvolvimento
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      ...config,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: config.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20) + '...'
    });
  }

  return config;
}

// Exportar configuração como constante
export const ENV = getEnvConfig();