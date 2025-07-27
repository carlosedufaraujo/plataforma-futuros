import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Debug completo das variáveis
console.log('🔍 DEBUG: Variáveis de ambiente no Cloudflare:');
console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl || 'UNDEFINED');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'UNDEFINED');

// Validação mais rigorosa
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Variáveis do Supabase não configuradas, usando localStorage como fallback');
  console.log('URL:', supabaseUrl ? '✅ Configurada' : '❌ Não encontrada');
  console.log('ANON_KEY:', supabaseAnonKey ? '✅ Configurada' : '❌ Não encontrada');
}

// Verificar se as variáveis não são placeholders
const isValidUrl = supabaseUrl && supabaseUrl !== 'your_supabase_project_url' && supabaseUrl.includes('supabase.co');
const isValidKey = supabaseAnonKey && supabaseAnonKey !== 'your_supabase_anon_key' && supabaseAnonKey.startsWith('eyJ');

if (!isValidUrl || !isValidKey) {
  console.warn('⚠️ Variáveis do Supabase inválidas ou são placeholders');
}

// Criar cliente apenas se as variáveis forem válidas
let supabase: any = null;
let supabaseAdmin: any = null;

if (isValidUrl && isValidKey) {
  try {
    supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      db: {
        schema: 'public'
      },
      global: {
        headers: {
          'X-Client-Info': 'acex-trading-platform'
        }
      }
    });

    // Cliente para operações administrativas (server-side)
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (serviceRoleKey && serviceRoleKey.startsWith('eyJ')) {
      supabaseAdmin = createClient<Database>(
        supabaseUrl, 
        serviceRoleKey,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      );
    }

    console.log('✅ Cliente Supabase criado com sucesso');
  } catch (error) {
    console.error('❌ Erro ao criar cliente Supabase:', error);
  }
}

export { supabase, supabaseAdmin };

// Função para verificar se o Supabase está disponível
export const isSupabaseAvailable = (): boolean => {
  return supabase !== null;
};

// Tipos helper para queries
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']; 