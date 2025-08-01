'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { User } from '@/types';

// Interface específica para o contexto de autenticação
interface AuthUser extends Pick<User, 'id' | 'nome' | 'email' | 'cpf' | 'telefone' | 'endereco'> {
  role: 'admin' | 'trader';
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: any) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Função helper para query com timeout - MAIS INTELIGENTE
const queryUserWithTimeout = async (userId: string, timeoutMs = 1500) => {
  
  return Promise.race([
    supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle(),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('USER_TABLE_TIMEOUT')), timeoutMs)
    )
  ]);
};

// Função para criar usuário básico baseado na sessão
const createBasicUser = (authUser: any) => {
  const basicUser = {
    id: authUser.id,
    nome: authUser.email?.split('@')[0] || 'Usuário',
    email: authUser.email || '',
    role: 'trader' as const
  };
  
  return basicUser;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Inicialização com logs detalhados e timeout de segurança
  useEffect(() => {
    let mounted = true;
    
    // TIMEOUT DE SEGURANÇA - nunca mais que 5 segundos loading
    const forceTimeout = setTimeout(() => {
      if (mounted) {
        setLoading(false);
      }
    }, 5000);
    
    const initAuth = async () => {
      try {
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ [AUTH] Erro na sessão:', error);
          throw error;
        }
        
        if (session?.user && mounted) {
          
          try {
            // Query com timeout reduzido
            const result = await queryUserWithTimeout(session.user.id, 1500);
            const { data: userData, error: userError } = result as any;
            
            if (userError || !userData) {
              if (mounted) {
                setUser(createBasicUser(session.user));
              }
            } else if (userData && mounted) {
              setUser({ ...userData, role: userData.role || 'trader' });
            }
          } catch (queryError: any) {
            // Timeout ou erro - usar dados básicos SILENCIOSAMENTE
            if (queryError.message === 'USER_TABLE_TIMEOUT') {
            } else {
            }
            
            if (mounted) {
              setUser(createBasicUser(session.user));
            }
          }
        } else {
        }
      } catch (error) {
        console.error('💥 [AUTH] Erro na inicialização:', error);
      } finally {
        if (mounted) {
          clearTimeout(forceTimeout);
          setLoading(false);
        }
      }
    };

    // Iniciar verificação
    initAuth();

    // Listener para mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        if (event === 'SIGNED_IN' && session?.user) {
          
          try {
            // Query com timeout reduzido
            const result = await queryUserWithTimeout(session.user.id, 1500);
            const { data: userData, error: userError } = result as any;
            
            if (userError || !userData) {
              if (mounted) {
                setUser(createBasicUser(session.user));
              }
            } else if (userData && mounted) {
              setUser({ ...userData, role: userData.role || 'trader' });
            }
          } catch (queryError: any) {
            // Timeout ou erro - usar dados básicos SILENCIOSAMENTE
            if (queryError.message === 'USER_TABLE_TIMEOUT') {
            } else {
            }
            
            if (mounted) {
              setUser(createBasicUser(session.user));
            }
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
        
        if (mounted) {
          setLoading(false);
        }
      }
    );

    return () => {
      mounted = false;
      clearTimeout(forceTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('❌ [AUTH] Erro no login:', error);
      throw error;
    }

    
    if (data.user) {
      try {
        // Query com timeout reduzido
        const result = await queryUserWithTimeout(data.user.id, 1500);
        const { data: userData, error: userError } = result as any;

        if (userError || !userData) {
          setUser(createBasicUser(data.user));
        } else {
          setUser({ ...userData, role: userData.role || 'trader' });
        }
      } catch (queryError: any) {
        // Timeout ou erro - usar dados básicos SILENCIOSAMENTE
        if (queryError.message === 'USER_TABLE_TIMEOUT') {
        } else {
        }
        
        setUser(createBasicUser(data.user));
      }
    }
  };

  const signUp = async (email: string, password: string, userData: any) => {
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error('❌ [AUTH] Erro no cadastro:', error);
      throw error;
    }


    if (data.user) {
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: data.user.email,
          nome: userData.nome,
          cpf: userData.cpf,
          telefone: userData.telefone,
          endereco: userData.endereco,
          role: 'trader',
        });

      if (insertError) {
        console.error('❌ [AUTH] Erro ao inserir usuário na tabela:', insertError);
        // Não falhar o cadastro por isso
      } else {
      }
    }
  };

  const signOut = async () => {
    
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('❌ [AUTH] Erro no logout:', error);
      throw error;
    }
    
    setUser(null);
    router.push('/login');
  };


  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signIn,
      signUp,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}