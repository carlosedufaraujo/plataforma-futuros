'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function DebugConnectionPage() {
  const [status, setStatus] = useState<any>({
    checking: true,
    connection: null,
    error: null,
    config: null
  });

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      // Verificar configuração
      const config = {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...',
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      };

      // Testar conexão básica
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .limit(1);

      // Verificar sessão
      const { data: sessionData } = await supabase.auth.getSession();

      setStatus({
        checking: false,
        connection: !error,
        error: error?.message,
        config,
        session: sessionData?.session,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      setStatus({
        checking: false,
        connection: false,
        error: err.message,
        config: null
      });
    }
  };

  return (
    <div className="min-h-screen p-8 bg-primary">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Debug de Conexão Supabase</h1>
        
        <div className="card p-6">
          <h2 className="text-lg font-bold mb-4">Status da Conexão</h2>
          
          {status.checking ? (
            <p>Verificando conexão...</p>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className={status.connection ? 'text-positive' : 'text-negative'}>
                  {status.connection ? '✅' : '❌'}
                </span>
                <span>Conexão: {status.connection ? 'OK' : 'FALHOU'}</span>
              </div>

              {status.error && (
                <div className="bg-negative/10 border border-negative p-4 rounded">
                  <p className="font-bold">Erro:</p>
                  <p className="text-sm">{status.error}</p>
                </div>
              )}

              {status.config && (
                <div className="bg-tertiary p-4 rounded">
                  <p className="font-bold mb-2">Configuração:</p>
                  <p className="text-sm">URL: {status.config.url}</p>
                  <p className="text-sm">Anon Key: {status.config.anonKey}</p>
                  <p className="text-sm">Has URL: {status.config.hasUrl ? '✅' : '❌'}</p>
                  <p className="text-sm">Has Key: {status.config.hasKey ? '✅' : '❌'}</p>
                </div>
              )}

              <div className="flex gap-4 mt-4">
                <button 
                  onClick={checkConnection}
                  className="btn btn-primary"
                >
                  Testar Novamente
                </button>
                
                <button 
                  onClick={() => window.location.href = '/login'}
                  className="btn btn-secondary"
                >
                  Ir para Login
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="card p-6 mt-8">
          <h2 className="text-lg font-bold mb-4">Instruções</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Verifique se o projeto Supabase está ativo</li>
            <li>Confirme que as variáveis de ambiente estão corretas</li>
            <li>A chave ANON deve ser diferente da SERVICE_ROLE</li>
            <li>Verifique se não há bloqueio de CORS ou firewall</li>
          </ol>
          
          <div className="mt-4 p-4 bg-tertiary rounded">
            <p className="font-bold">Para obter a chave ANON correta:</p>
            <ol className="list-decimal list-inside mt-2 text-sm">
              <li>Acesse seu projeto no Supabase Dashboard</li>
              <li>Vá em Settings → API</li>
              <li>Copie a chave "anon public"</li>
              <li>Atualize NEXT_PUBLIC_SUPABASE_ANON_KEY no .env.local</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}