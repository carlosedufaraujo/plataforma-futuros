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
  const fetchUserData = async (authUserId: string): Promise<User | null> => {
    try {
      console.log('🔍 Buscando dados do usuário:', authUserId);
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUserId)
        .single();

      if (error) {
        console.error('❌ Erro ao buscar usuário:', error);
        return null;
      }

      console.log('✅ Dados do usuário encontrados:', data);
      
      // Garantir que o role está incluído
      const userData = {
        ...data,
        role: data.role || 'trader' // Default para trader se não tiver role
      };

      return userData;
    } catch (error) {
      console.error('💥 Erro inesperado ao buscar dados do usuário:', error);
      return null;
    }
  };

  // Verificar sessão ao carregar
  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        console.log('🔄 Verificando sessão existente...');
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Erro ao verificar sessão:', error);
          if (mounted) {
            setLoading(false);
          }
          return;
        }

        if (session?.user && mounted) {
          console.log('👤 Sessão encontrada, buscando dados do usuário...');
          const userData = await fetchUserData(session.user.id);
          if (userData && mounted) {
            setUser(userData);
            console.log('✅ Estado do usuário atualizado');
          }
        } else {
          console.log('ℹ️ Nenhuma sessão ativa encontrada');
        }
      } catch (error) {
        console.error('💥 Erro inesperado ao verificar sessão:', error);
      } finally {
        if (mounted) {
          console.log('🔓 Loading definido como false');
          setLoading(false);
        }
      }
    };

    checkSession();

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Mudança de estado auth:', event);
      
      if (!mounted) return;

      if (event === 'SIGNED_IN' && session?.user) {
        console.log('✅ Usuário logado via state change');
        const userData = await fetchUserData(session.user.id);
        if (userData && mounted) {
          setUser(userData);
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('🚪 Usuário deslogado');
        if (mounted) {
          setUser(null);
          router.push('/login');
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
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
        toast.error(error.message || 'Erro ao fazer login');
        throw error;
      }

      console.log('✅ Login realizado com sucesso');
      
      if (data.user) {
        const userData = await fetchUserData(data.user.id);
        if (userData) {
          setUser(userData);
          toast.success('Login realizado com sucesso!');
          
          // Redirecionamento após um pequeno delay
          setTimeout(() => {
            router.push('/');
          }, 500);
        }
      }
    } catch (error: any) {
      console.error('💥 Erro no signIn:', error);
      toast.error(error.message || 'Erro ao fazer login');
      throw error;
    }
  };

  const signUp = async (email: string, password: string, userData: Partial<User>) => {
    try {
      console.log('📝 Tentando criar conta para:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });

      if (error) {
        console.error('❌ Erro no signup:', error);
        toast.error(error.message || 'Erro ao criar conta');
        throw error;
      }

      if (data.user) {
        // Criar entrada na tabela users
        const userRecord = {
          id: data.user.id,
          email: data.user.email!,
          nome: userData.nome || '',
          cpf: userData.cpf || '',
          telefone: userData.telefone || '',
          endereco: userData.endereco || '',
          role: 'trader', // Novo usuário sempre começa como trader
          ativo: true,
          createdAt: new Date().toISOString()
        };

        const { error: dbError } = await supabase
          .from('users')
          .insert([userRecord]);

        if (dbError) {
          console.error('❌ Erro ao salvar dados do usuário:', dbError);
          toast.error('Erro ao salvar dados do usuário');
          throw dbError;
        }

        console.log('✅ Conta criada com sucesso');
        toast.success('Conta criada! Verifique seu email para confirmar.');
      }
    } catch (error: any) {
      console.error('💥 Erro no signUp:', error);
      toast.error(error.message || 'Erro ao criar conta');
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log('🚪 Fazendo logout...');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Erro no logout:', error);
        throw error;
      }

      setUser(null);
      console.log('✅ Logout realizado com sucesso');
      toast.success('Logout realizado com sucesso!');
      router.push('/login');
    } catch (error: any) {
      console.error('💥 Erro no signOut:', error);
      toast.error(error.message || 'Erro ao fazer logout');
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      console.log('🔄 Atualizando dados do usuário...');
      
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (authUser) {
        const userData = await fetchUserData(authUser.id);
        if (userData) {
          setUser(userData);
          console.log('✅ Dados do usuário atualizados');
        }
      }
    } catch (error) {
      console.error('💥 Erro ao atualizar usuário:', error);
    }
  };

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