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

  // Buscar dados do usuário no banco
  const fetchUserData = async (authUserId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUserId)
        .single();

      if (error) throw error;

      // Garantir que o role está incluído
      const userData = {
        ...data,
        role: data.role || 'trader'
      } as User;

      console.log('👤 Dados do usuário carregados:', {
        id: userData.id,
        nome: userData.nome,
        email: userData.email,
        role: userData.role
      });

      return userData;
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      return null;
    }
  };

  // Verificar sessão ao carregar
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const userData = await fetchUserData(session.user.id);
          if (userData) {
            setUser(userData);
          }
        }
      } catch (error) {
        console.error('Erro ao verificar sessão:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const userData = await fetchUserData(session.user.id);
        if (userData) {
          setUser(userData);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        router.push('/login');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔑 Tentando fazer login com:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('❌ Erro no login:', error);
        throw error;
      }

      console.log('✅ Login realizado, dados da sessão:', data);

      if (data.user) {
        const userData = await fetchUserData(data.user.id);
        if (userData) {
          console.log('✅ Dados do usuário carregados, redirecionando...');
          setUser(userData);
          // Aguardar um pouco antes do redirecionamento para garantir que o estado foi atualizado
          setTimeout(() => {
            router.push('/');
          }, 100);
        } else {
          throw new Error('Usuário não encontrado no banco de dados');
        }
      }
    } catch (error: any) {
      console.error('❌ Erro no login:', error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, userData: Partial<User>) => {
    try {
      console.log('📝 Tentando criar conta para:', email);
      
      // 1. Criar conta no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nome: userData.nome,
            cpf: userData.cpf
          }
        }
      });

      if (authError) {
        console.error('❌ Erro na criação da conta auth:', authError);
        throw authError;
      }

      console.log('✅ Conta auth criada:', authData.user?.id);

      // 2. Criar registro na tabela users
      if (authData.user) {
        const { error: userError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            nome: userData.nome,
            cpf: userData.cpf,
            email: userData.email,
            telefone: userData.telefone,
            endereco: userData.endereco,
            is_active: true,
            role: 'trader',
            created_at: new Date().toISOString()
          });

        if (userError) {
          console.error('❌ Erro ao criar usuário no banco:', userError);
          // Não tentar deletar a conta auth no cliente - isso requer permissões admin
          throw new Error(`Erro ao criar perfil do usuário: ${userError.message}`);
        }

        console.log('✅ Usuário criado no banco com sucesso');
        toast.success('Cadastro realizado com sucesso!');
      }
    } catch (error: any) {
      console.error('❌ Erro no cadastro:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      toast.success('Logout realizado com sucesso');
      router.push('/login');
    } catch (error: any) {
      console.error('Erro no logout:', error);
      toast.error('Erro ao fazer logout');
    }
  };

  const refreshUser = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (authUser) {
        const userData = await fetchUserData(authUser.id);
        if (userData) {
          setUser(userData);
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signIn,
      signUp,
      signOut,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};