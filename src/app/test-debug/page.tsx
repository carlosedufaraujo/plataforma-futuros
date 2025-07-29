'use client';

import { useState, useEffect } from 'react';

export default function TestDebugPage() {
  const [logs, setLogs] = useState<string[]>([]);
  
  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  useEffect(() => {
    runTests();
  }, []);

  const runTests = async () => {
    addLog('=== INICIANDO TESTES DE DEBUG ===');
    
    try {
      // 1. Verificar ENV
      addLog('1. Verificando configuração ENV...');
      const { ENV } = await import('@/config/env');
      addLog(`URL: ${ENV.NEXT_PUBLIC_SUPABASE_URL}`);
      addLog(`Key: ${ENV.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 30)}...`);
      
      // 2. Verificar process.env
      addLog('\n2. Verificando process.env...');
      addLog(`process.env URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL || 'NÃO DEFINIDA'}`);
      addLog(`process.env Key: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'DEFINIDA' : 'NÃO DEFINIDA'}`);
      
      // 3. Testar criação do cliente
      addLog('\n3. Testando criação do cliente Supabase...');
      const { createClient } = await import('@supabase/supabase-js');
      
      const client = createClient(
        ENV.NEXT_PUBLIC_SUPABASE_URL,
        ENV.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false
          }
        }
      );
      addLog('Cliente criado com sucesso!');
      
      // 4. Testar query com timeout
      addLog('\n4. Testando query com timeout de 5s...');
      const queryPromise = client
        .from('users')
        .select('count')
        .limit(1);
        
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout após 5 segundos')), 5000)
      );
      
      try {
        const result = await Promise.race([queryPromise, timeoutPromise]);
        addLog(`Query completada: ${JSON.stringify(result)}`);
      } catch (error: any) {
        addLog(`Erro na query: ${error.message}`);
      }
      
      // 5. Testar fetch direto com POST
      addLog('\n5. Testando login via POST direto...');
      const loginResponse = await fetch(`${ENV.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': ENV.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          email: 'carloseduardo@acexcapital.com',
          password: 'Acex@2025'
        })
      });
      
      const loginData = await loginResponse.json();
      addLog(`Login response: ${loginResponse.status} - ${loginData.error || 'Success'}`);
      
    } catch (err: any) {
      addLog(`\nERRO GERAL: ${err.message}`);
      console.error('Erro completo:', err);
    }
    
    addLog('\n=== TESTES CONCLUÍDOS ===');
  };

  return (
    <div className="min-h-screen p-8 bg-primary">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Debug Detalhado</h1>
        
        <div className="card p-6">
          <div className="bg-black rounded p-4 max-h-96 overflow-y-auto">
            <pre className="text-green-400 text-xs font-mono whitespace-pre-wrap">
              {logs.join('\n') || 'Executando testes...'}
            </pre>
          </div>
          
          <button 
            onClick={() => window.location.reload()}
            className="btn btn-primary mt-4"
          >
            Executar Novamente
          </button>
        </div>

        <div className="card p-6 mt-8">
          <h3 className="font-bold mb-2">O que este teste verifica:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Configuração do ENV vs process.env</li>
            <li>Criação do cliente Supabase</li>
            <li>Query com timeout de 5 segundos</li>
            <li>Teste de autenticação direto</li>
          </ol>
        </div>
      </div>
    </div>
  );
}