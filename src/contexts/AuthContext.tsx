'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

interface AuthUser {
  id: string;
  nome: string;
  email: string;
  role: 'admin' | 'trader';
  cpf?: string;
  telefone?: string;
  endereco?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: any) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Inicialização com logs detalhados e timeout de segurança
  useEffect(() => {
    console.log('🚀 [AUTH] AuthProvider iniciado');
    let mounted = true;
    
    // TIMEOUT DE SEGURANÇA - nunca mais que 5 segundos loading
    const forceTimeout = setTimeout(() => {
      console.log('⏰ [AUTH] TIMEOUT FORÇADO! Definindo loading=false após 5s');
      if (mounted) {
        setLoading(false);
      }
    }, 5000);
    
    const initAuth = async () => {
      try {
        console.log('🔍 [AUTH] Iniciando verificação de sessão...');
        
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('📊 [AUTH] Resultado getSession:', { 
          hasSession: !!session, 
          hasUser: !!session?.user, 
          error: error?.message 
        });
        
        if (error) {
          console.error('❌ [AUTH] Erro na sessão:', error);
          throw error;
        }
        
        if (session?.user && mounted) {
          console.log('👤 [AUTH] Usuário encontrado, buscando dados...', session.user.email);
          
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          console.log('📊 [AUTH] Resultado busca usuário:', { 
            hasUserData: !!userData, 
            error: userError?.message 
          });
            
          if (userError) {
            console.error('❌ [AUTH] Erro ao buscar usuário:', userError);
            // Não é erro crítico - usuário pode não existir na tabela ainda
          } else if (userData && mounted) {
            console.log('✅ [AUTH] Usuário carregado:', userData.nome);
            setUser({ ...userData, role: userData.role || 'trader' });
          }
        } else {
          console.log('ℹ️ [AUTH] Nenhuma sessão ativa encontrada');
        }
      } catch (error) {
        console.error('💥 [AUTH] Erro na inicialização:', error);
      } finally {
        console.log('🔓 [AUTH] Definindo loading=false');
        if (mounted) {
          clearTimeout(forceTimeout);
          setLoading(false);
        }
      }
    };

    // Iniciar verificação
    initAuth();

    // Listener para mudanças de auth
    console.log('👂 [AUTH] Configurando listener de mudanças...');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 [AUTH] Estado mudou:', event, { hasSession: !!session });
        if (!mounted) return;
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('✅ [AUTH] Login detectado, buscando dados do usuário...');
          
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (userError) {
            console.error('❌ [AUTH] Erro ao buscar usuário após login:', userError);
          } else if (userData && mounted) {
            console.log('✅ [AUTH] Usuário definido após login:', userData.nome);
            setUser({ ...userData, role: userData.role || 'trader' });
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('👋 [AUTH] Logout detectado');
          setUser(null);
        }
        
        if (mounted) {
          setLoading(false);
        }
      }
    );

    return () => {
      console.log('🧹 [AUTH] Limpando AuthProvider...');
      mounted = false;
      clearTimeout(forceTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log('🔑 [AUTH] Tentando login para:', email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('❌ [AUTH] Erro no login:', error);
      throw error;
    }

    console.log('✅ [AUTH] Login bem-sucedido');
    
    if (data.user) {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (userError) {
        console.error('❌ [AUTH] Usuário não encontrado na tabela users:', userError);
        throw new Error('Usuário não encontrado no banco de dados');
      }
      
      console.log('✅ [AUTH] Dados do usuário carregados:', userData.nome);
      setUser({ ...userData, role: userData.role || 'trader' });
    }
  };

  const signUp = async (email: string, password: string, userData: any) => {
    console.log('📝 [AUTH] Tentando cadastro para:', email);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      console.error('❌ [AUTH] Erro no cadastro:', error);
      throw error;
    }

    console.log('✅ [AUTH] Cadastro bem-sucedido');

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
        throw insertError;
      }
      
      console.log('✅ [AUTH] Usuário inserido na tabela com sucesso');
    }
  };

  const signOut = async () => {
    console.log('👋 [AUTH] Fazendo logout...');
    
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('❌ [AUTH] Erro no logout:', error);
      throw error;
    }
    
    console.log('✅ [AUTH] Logout bem-sucedido');
    setUser(null);
    router.push('/login');
  };

  // Log do estado atual a cada render
  console.log('📊 [AUTH] Estado atual:', { 
    hasUser: !!user, 
    userName: user?.nome || 'N/A', 
    loading 
  });

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