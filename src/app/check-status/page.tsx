'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function CheckStatusPage() {
  const [status, setStatus] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const checkEverything = async () => {
    setLoading(true);
    const results: any = {};

    try {
      // 1. Verificar configuração
      results.config = {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      };

      // 2. Testar conexão básica
      try {
        const { count, error } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true });
        
        results.connection = {
          success: !error,
          error: error?.message,
          userCount: count
        };
      } catch (e: any) {
        results.connection = { success: false, error: e.message };
      }

      // 3. Testar login
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: 'carloseduardo@acexcapital.com',
          password: 'Acex@2025'
        });

        results.auth = {
          success: !error,
          error: error?.message,
          user: data?.user?.email
        };

        // Se login funcionou, fazer logout
        if (!error) {
          await supabase.auth.signOut();
        }
      } catch (e: any) {
        results.auth = { success: false, error: e.message };
      }

    } catch (e: any) {
      results.generalError = e.message;
    }

    setStatus(results);
    setLoading(false);
  };

  return (
    <div className="min-h-screen p-8 bg-primary">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Verificação de Status</h1>
        
        <div className="card p-6">
          <button 
            onClick={checkEverything}
            disabled={loading}
            className="btn btn-primary mb-6"
          >
            {loading ? 'Verificando...' : 'Verificar Sistema'}
          </button>

          {Object.keys(status).length > 0 && (
            <div className="space-y-4">
              {/* Configuração */}
              <div className="p-4 bg-tertiary rounded">
                <h3 className="font-bold mb-2">Configuração:</h3>
                <p>URL: {status.config?.url ? '✅' : '❌'}</p>
                <p>Chave: {status.config?.hasKey ? '✅' : '❌'}</p>
              </div>

              {/* Conexão */}
              <div className="p-4 bg-tertiary rounded">
                <h3 className="font-bold mb-2">Conexão com Banco:</h3>
                <p>Status: {status.connection?.success ? '✅ OK' : '❌ Falhou'}</p>
                {status.connection?.error && (
                  <p className="text-negative text-sm">Erro: {status.connection.error}</p>
                )}
                {status.connection?.userCount !== undefined && (
                  <p>Usuários no banco: {status.connection.userCount}</p>
                )}
              </div>

              {/* Autenticação */}
              <div className="p-4 bg-tertiary rounded">
                <h3 className="font-bold mb-2">Teste de Login:</h3>
                <p>Status: {status.auth?.success ? '✅ OK' : '❌ Falhou'}</p>
                {status.auth?.error && (
                  <p className="text-negative text-sm">Erro: {status.auth.error}</p>
                )}
                {status.auth?.user && (
                  <p className="text-positive text-sm">Login bem-sucedido: {status.auth.user}</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="card p-6 mt-8">
          <h3 className="font-bold mb-4">Próximos Passos:</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>Se tudo estiver ✅, acesse <a href="/login" className="text-primary hover:underline">/login</a></li>
            <li>Se houver ❌, verifique as mensagens de erro</li>
            <li>O servidor está rodando em: <strong>http://localhost:3001</strong></li>
          </ul>
        </div>
      </div>
    </div>
  );
}