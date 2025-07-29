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
      console.log('🔍 [fetchUserData] Iniciando busca para:', authUserId);
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUserId)
        .single();

      if (error) {
        console.error('❌ [fetchUserData] Erro na query:', error);
        console.error('❌ [fetchUserData] Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        return null;
      }

      console.log('✅ [fetchUserData] Dados encontrados:', data);
      
      // Garantir que o role está incluído
      const userData = {
        ...data,
        role: data.role || 'trader' // Default para trader se não tiver role
      };

      console.log('✅ [fetchUserData] Dados processados:', userData);
      return userData;
    } catch (error) {
      console.error('💥 [fetchUserData] Erro inesperado:', error);
      return null;
    }
  };

  // Verificar sessão ao carregar
  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    console.log('🔄 [AuthProvider] useEffect iniciado');

    // Timeout de segurança - se não resolver em 10 segundos, força loading=false
    const safetyTimeout = setTimeout(() => {
      if (mounted && loading) {
        console.log('⏰ [AuthProvider] TIMEOUT DE SEGURANÇA - Forçando loading=false após 10s');
        setLoading(false);
      }
    }, 10000);

    const checkSession = async () => {
      try {
        console.log('🔄 [checkSession] Iniciando verificação de sessão...');
        
        // Teste básico de conectividade primeiro
        console.log('📡 [checkSession] Testando conectividade básica...');
        const connectivityTest = await supabase.from('contracts').select('count').limit(1);
        
        if (connectivityTest.error) {
          console.error('❌ [checkSession] Erro de conectividade básica:', connectivityTest.error);
          if (mounted) {
            setLoading(false);
          }
          return;
        }
        
        console.log('✅ [checkSession] Conectividade básica OK');
        
        console.log('🔑 [checkSession] Chamando getSession...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        console.log('📊 [checkSession] Resultado getSession:', {
          session: session ? 'EXISTS' : 'NULL',
          error: error ? error.message : 'NO_ERROR',
          userId: session?.user?.id || 'NO_USER'
        });
        
        if (error) {
          console.error('❌ [checkSession] Erro em getSession:', error);
          if (mounted) {
            console.log('🔓 [checkSession] Definindo loading=false devido a erro');
            setLoading(false);
          }
          return;
        }

        if (session?.user && mounted) {
          console.log('👤 [checkSession] Sessão encontrada, buscando dados do usuário...');
          console.log('👤 [checkSession] User ID:', session.user.id);
          console.log('👤 [checkSession] User Email:', session.user.email);
          
          const userData = await fetchUserData(session.user.id);
          
          if (userData && mounted) {
            console.log('✅ [checkSession] Dados do usuário carregados, definindo user state');
            setUser(userData);
            console.log('✅ [checkSession] Estado do usuário atualizado');
          } else {
            console.log('❌ [checkSession] Falha ao carregar dados do usuário');
          }
        } else {
          console.log('ℹ️ [checkSession] Nenhuma sessão ativa encontrada');
        }
      } catch (error) {
        console.error('💥 [checkSession] Erro inesperado:', error);
      } finally {
        if (mounted) {
          console.log('🔓 [checkSession] Definindo loading=false no finally');
          setLoading(false);
          clearTimeout(safetyTimeout);
        }
      }
    };

    // Iniciar verificação após pequeno delay
    timeoutId = setTimeout(() => {
      console.log('⏰ [AuthProvider] Iniciando checkSession após delay');
      checkSession();
    }, 100);

    // Escutar mudanças de autenticação
    console.log('👂 [AuthProvider] Configurando listener de auth state change');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 [AuthStateChange] Evento recebido:', event);
      console.log('🔄 [AuthStateChange] Session:', session ? 'EXISTS' : 'NULL');
      
      if (!mounted) {
        console.log('⚠️ [AuthStateChange] Componente não está mounted, ignorando');
        return;
      }

      if (event === 'SIGNED_IN' && session?.user) {
        console.log('✅ [AuthStateChange] Usuário logado via state change');
        const userData = await fetchUserData(session.user.id);
        if (userData && mounted) {
          setUser(userData);
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('🚪 [AuthStateChange] Usuário deslogado');
        if (mounted) {
          setUser(null);
          router.push('/login');
        }
      }
    });

    return () => {
      console.log('🧹 [AuthProvider] Cleanup executado');
      mounted = false;
      clearTimeout(timeoutId);
      clearTimeout(safetyTimeout);
      subscription.unsubscribe();
    };
  }, [router]);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔑 [signIn] Tentando fazer login com:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('❌ [signIn] Erro no login:', error);
        toast.error(error.message || 'Erro ao fazer login');
        throw error;
      }

      console.log('✅ [signIn] Login realizado com sucesso');
      
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
      console.error('💥 [signIn] Erro:', error);
      toast.error(error.message || 'Erro ao fazer login');
      throw error;
    }
  };

  const signUp = async (email: string, password: string, userData: Partial<User>) => {
    try {
      console.log('📝 [signUp] Tentando criar conta para:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });

      if (error) {
        console.error('❌ [signUp] Erro no signup:', error);
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
          console.error('❌ [signUp] Erro ao salvar dados do usuário:', dbError);
          toast.error('Erro ao salvar dados do usuário');
          throw dbError;
        }

        console.log('✅ [signUp] Conta criada com sucesso');
        toast.success('Conta criada! Verifique seu email para confirmar.');
      }
    } catch (error: any) {
      console.error('💥 [signUp] Erro:', error);
      toast.error(error.message || 'Erro ao criar conta');
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log('🚪 [signOut] Fazendo logout...');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ [signOut] Erro no logout:', error);
        throw error;
      }

      setUser(null);
      console.log('✅ [signOut] Logout realizado com sucesso');
      toast.success('Logout realizado com sucesso!');
      router.push('/login');
    } catch (error: any) {
      console.error('💥 [signOut] Erro:', error);
      toast.error(error.message || 'Erro ao fazer logout');
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      console.log('🔄 [refreshUser] Atualizando dados do usuário...');
      
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (authUser) {
        const userData = await fetchUserData(authUser.id);
        if (userData) {
          setUser(userData);
          console.log('✅ [refreshUser] Dados do usuário atualizados');
        }
      }
    } catch (error) {
      console.error('💥 [refreshUser] Erro:', error);
    }
  };

  // Log do estado atual
  console.log('📊 [AuthProvider] Estado atual:', {
    user: user ? `${user.nome} (${user.email})` : 'NULL',
    loading,
    timestamp: new Date().toISOString()
  });

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