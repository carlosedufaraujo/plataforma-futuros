'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { User } from '@/types';
import { toast } from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: Partial<User>) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // TIMEOUT AGRESSIVO - FORÇA loading=false APÓS 3 SEGUNDOS
  useEffect(() => {
    console.log('🚀 [AUTH] Iniciando com timeout agressivo de 3s');
    
    const forceStopLoading = setTimeout(() => {
      console.log('⏰ [AUTH] TIMEOUT! Forçando loading=false após 3s');
      setLoading(false);
    }, 3000);

    // Verificação rápida de sessão
    const quickCheck = async () => {
      try {
        console.log('🔍 [AUTH] Verificação rápida...');
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.log('❌ [AUTH] Erro na sessão:', error.message);
          setLoading(false);
          clearTimeout(forceStopLoading);
          return;
        }

        if (session?.user) {
          console.log('✅ [AUTH] Sessão encontrada, buscando usuário...');
          
          const { data, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (!userError && data) {
            console.log('✅ [AUTH] Usuário carregado:', data.nome);
            setUser({ ...data, role: data.role || 'trader' });
          } else {
            console.log('⚠️ [AUTH] Erro ao buscar usuário:', userError?.message);
          }
        } else {
          console.log('ℹ️ [AUTH] Sem sessão ativa');
        }
      } catch (error) {
        console.log('💥 [AUTH] Erro:', error);
      } finally {
        console.log('🔓 [AUTH] Definindo loading=false');
        setLoading(false);
        clearTimeout(forceStopLoading);
      }
    };

    // Iniciar verificação após 500ms
    const checkTimeout = setTimeout(quickCheck, 500);

    // Listener simplificado
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 [AUTH] State change:', event);
      
      if (event === 'SIGNED_IN' && session?.user) {
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (data) {
          setUser({ ...data, role: data.role || 'trader' });
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        router.push('/login');
      }
    });

    return () => {
      clearTimeout(forceStopLoading);
      clearTimeout(checkTimeout);
      subscription?.unsubscribe();
    };
  }, [router]);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔑 [AUTH] Login:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        toast.error(error.message);
        throw error;
      }

      if (data.user) {
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();
        
        if (userData) {
          setUser({ ...userData, role: userData.role || 'trader' });
          toast.success('Login realizado!');
          setTimeout(() => router.push('/'), 500);
        }
      }
    } catch (error: any) {
      console.error('❌ [AUTH] Erro no login:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, userData: Partial<User>) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });

      if (error) throw error;

      if (data.user) {
        await supabase.from('users').insert([{
          id: data.user.id,
          email: data.user.email!,
          nome: userData.nome || '',
          cpf: userData.cpf || '',
          telefone: userData.telefone || '',
          endereco: userData.endereco || '',
          role: 'trader',
          ativo: true,
          createdAt: new Date().toISOString()
        }]);

        toast.success('Conta criada! Verifique seu email.');
      }
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      toast.success('Logout realizado!');
      router.push('/login');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const refreshUser = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (authUser) {
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single();
        
        if (data) {
          setUser({ ...data, role: data.role || 'trader' });
        }
      }
    } catch (error) {
      console.error('❌ [AUTH] Erro ao atualizar:', error);
    }
  };

  console.log('📊 [AUTH] Estado:', { user: user?.nome || 'NULL', loading });

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};