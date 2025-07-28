import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

// Usar diretamente as variáveis de ambiente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kdfevkbwohcajcwrqzor.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkZmV2a2J3b2hjYWpjd3Jxem9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMTUzODcsImV4cCI6MjA2ODg5MTM4N30.4nBjKi3rdpfbYmxeoa8GELdBLq8JY6ym68cJX7jpaus';

// Debug - verificar valores
if (typeof window !== 'undefined') {
  console.log('🔍 Supabase Config Debug:');
  console.log('URL:', supabaseUrl);
  console.log('Key length:', supabaseAnonKey?.length);
  console.log('Key preview:', supabaseAnonKey?.substring(0, 50) + '...');
}

// Criar cliente com configuração simplificada
const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Cliente admin
let supabaseAdmin: any = null;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (serviceRoleKey) {
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

export { supabase, supabaseAdmin };

// Função para verificar se o Supabase está disponível
export const isSupabaseAvailable = (): boolean => {
  return supabase !== null;
};

// Tipos helper para queries
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']; 