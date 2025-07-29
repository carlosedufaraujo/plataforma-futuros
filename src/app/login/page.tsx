'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signUp, user, loading: authLoading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [pageReady, setPageReady] = useState(false);
  
  // Estados do formulário
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nome: '',
    cpf: '',
    telefone: '',
    endereco: ''
  });

  // TIMEOUT INDEPENDENTE - Força page ready após 4 segundos no máximo
  useEffect(() => {
    console.log('🚀 [LOGIN] Página de login iniciada');
    console.log('📊 [LOGIN] AuthLoading inicial:', authLoading);
    
    // Timeout de segurança independente do AuthContext
    const pageTimeout = setTimeout(() => {
      console.log('⏰ [LOGIN] TIMEOUT PRÓPRIO! Forçando página pronta após 4s');
      setPageReady(true);
    }, 4000);

    // Verificar estado periodicamente
    const checkInterval = setInterval(() => {
      console.log('🔍 [LOGIN] Estado atual - authLoading:', authLoading, 'user:', user ? 'EXISTS' : 'NULL');
      
      // Se authLoading for false ou user existir, página está pronta
      if (!authLoading || user) {
        console.log('✅ [LOGIN] Página pronta por estado normal');
        setPageReady(true);
        clearInterval(checkInterval);
        clearTimeout(pageTimeout);
      }
    }, 1000);

    return () => {
      clearTimeout(pageTimeout);
      clearInterval(checkInterval);
    };
  }, [authLoading, user]);

  // Redirecionar se já estiver logado
  useEffect(() => {
    if (user && !authLoading) {
      console.log('👤 [LOGIN] Usuário já logado, redirecionando...');
      router.push('/');
    }
  }, [user, authLoading, router]);

  // Mostrar loading apenas se a página não estiver pronta E ainda estiver carregando auth
  const shouldShowLoading = !pageReady && authLoading;

  console.log('🎯 [LOGIN] Render - pageReady:', pageReady, 'authLoading:', authLoading, 'shouldShowLoading:', shouldShowLoading);

  if (shouldShowLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-secondary">Verificando autenticação...</p>
          <p className="text-xs text-neutral mt-2">Máximo 4 segundos...</p>
        </div>
      </div>
    );
  }

  // Se já estiver logado, não renderizar nada (vai redirecionar)
  if (user) {
    console.log('🚪 [LOGIN] Usuário logado, não renderizando form');
    return null;
  }

  // Formatar CPF
  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})/, '$1-$2');
    }
    return value;
  };

  // Formatar telefone
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2');
    }
    return value;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'cpf') {
      setFormData({ ...formData, [name]: formatCPF(value) });
    } else if (name === 'telefone') {
      setFormData({ ...formData, [name]: formatPhone(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔑 [LOGIN] Iniciando processo de', isLogin ? 'login' : 'cadastro');
    setLoading(true);

    // Timeout de segurança para o formulário - nunca mais que 10 segundos
    const formTimeout = setTimeout(() => {
      console.log('⏰ [LOGIN] TIMEOUT DO FORMULÁRIO! Forçando loading=false após 10s');
      setLoading(false);
      toast.error('Tempo limite excedido. Tente novamente.');
    }, 10000);

    try {
      if (isLogin) {
        console.log('📝 [LOGIN] Fazendo login para:', formData.email);
        await signIn(formData.email, formData.password);
        console.log('✅ [LOGIN] Login bem-sucedido');
        toast.success('Login realizado com sucesso!');
      } else {
        console.log('📝 [LOGIN] Criando conta para:', formData.email);
        await signUp(formData.email, formData.password, {
          nome: formData.nome,
          cpf: formData.cpf.replace(/\D/g, ''),
          email: formData.email,
          telefone: formData.telefone,
          endereco: formData.endereco
        });
        
        console.log('✅ [LOGIN] Cadastro bem-sucedido');
        toast.success('Cadastro realizado com sucesso! Faça login para continuar.');
        setIsLogin(true);
        setFormData({
          email: formData.email,
          password: '',
          nome: '',
          cpf: '',
          telefone: '',
          endereco: ''
        });
      }
    } catch (error: any) {
      console.error('❌ [LOGIN] Erro:', error);
      toast.error(error.message || 'Erro ao processar solicitação');
    } finally {
      console.log('🔓 [LOGIN] Finalizando processo');
      clearTimeout(formTimeout);
      setLoading(false);
    }
  };

  console.log('🎨 [LOGIN] Renderizando formulário');

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary">
      <div className="card w-full max-w-md p-8">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="logo-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center mb-8">
          {isLogin ? 'Entrar na Plataforma' : 'Criar Conta'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Nome Completo
                </label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  className="input w-full"
                  required={!isLogin}
                  placeholder="Seu nome completo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  CPF
                </label>
                <input
                  type="text"
                  name="cpf"
                  value={formData.cpf}
                  onChange={handleInputChange}
                  className="input w-full"
                  required={!isLogin}
                  placeholder="000.000.000-00"
                  maxLength={14}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Telefone
                </label>
                <input
                  type="text"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleInputChange}
                  className="input w-full"
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Endereço
                </label>
                <input
                  type="text"
                  name="endereco"
                  value={formData.endereco}
                  onChange={handleInputChange}
                  className="input w-full"
                  placeholder="Cidade, Estado"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="input w-full"
              required
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Senha
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="input w-full"
              required
              placeholder={isLogin ? 'Sua senha' : 'Mínimo 6 caracteres'}
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="spinner mr-2"></div>
                Processando... (máx. 10s)
              </div>
            ) : (
              isLogin ? 'Entrar' : 'Criar Conta'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-info hover:underline"
          >
            {isLogin 
              ? 'Não tem uma conta? Cadastre-se' 
              : 'Já tem uma conta? Faça login'}
          </button>
        </div>

        {/* Debug info - removível em produção */}
        <div className="mt-4 text-xs text-neutral text-center opacity-50">
          Debug: pageReady={pageReady.toString()}, authLoading={authLoading.toString()}
        </div>
      </div>
    </div>
  );
}