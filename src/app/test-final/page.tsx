'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function TestFinalPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const router = useRouter();

  const testLogin = async () => {
    setLoading(true);
    setResult(null);

    try {
      // Testar login
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'carloseduardo@acexcapital.com',
        password: 'Acex@2025'
      });

      if (error) {
        setResult({ success: false, error: error.message });
      } else {
        setResult({ 
          success: true, 
          user: data.user?.email,
          message: 'Login bem-sucedido! Redirecionando...'
        });
        
        // Redirecionar após 2 segundos
        setTimeout(() => {
          router.push('/');
        }, 2000);
      }
    } catch (err: any) {
      setResult({ success: false, error: err.message });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary">
      <div className="card p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">Teste Final de Login</h1>
        
        <div className="space-y-4">
          <div className="text-sm text-muted">
            <p>Email: carloseduardo@acexcapital.com</p>
            <p>Senha: Acex@2025</p>
          </div>

          <button
            onClick={testLogin}
            disabled={loading}
            className="btn btn-primary w-full"
          >
            {loading ? 'Testando...' : 'Testar Login'}
          </button>

          {result && (
            <div className={`p-4 rounded ${result.success ? 'bg-positive/10 text-positive' : 'bg-negative/10 text-negative'}`}>
              {result.success ? (
                <div>
                  <p>✅ {result.message}</p>
                  <p className="text-sm">Usuário: {result.user}</p>
                </div>
              ) : (
                <p>❌ Erro: {result.error}</p>
              )}
            </div>
          )}

          <div className="flex gap-4 mt-6">
            <button
              onClick={() => router.push('/login')}
              className="btn btn-secondary flex-1"
            >
              Ir para Login
            </button>
            <button
              onClick={() => router.push('/')}
              className="btn btn-secondary flex-1"
            >
              Ir para Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}