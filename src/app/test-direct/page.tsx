'use client';

import { useState } from 'react';

export default function TestDirectPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testDirectConnection = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      // Teste direto com a API do Supabase
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      // Teste 1: Health check
      const healthResponse = await fetch(`${url}/rest/v1/`, {
        headers: {
          'apikey': anonKey || '',
          'Authorization': `Bearer ${anonKey}`
        }
      });
      
      // Teste 2: Tentar fazer login
      const loginResponse = await fetch(`${url}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': anonKey || '',
        },
        body: JSON.stringify({
          email: 'carloseduardo@acexcapital.com',
          password: 'Acex@2025'
        })
      });
      
      const loginData = await loginResponse.json();
      
      setResult({
        supabaseUrl: url,
        healthStatus: healthResponse.status,
        healthOk: healthResponse.ok,
        loginStatus: loginResponse.status,
        loginOk: loginResponse.ok,
        loginData: loginData,
        timestamp: new Date().toISOString()
      });
      
    } catch (err: any) {
      setResult({
        error: err.message,
        stack: err.stack
      });
    } finally {
      setLoading(false);
    }
  };

  const testWithFetch = async () => {
    setLoading(true);
    try {
      // Teste usando fetch puro para verificar CORS
      const response = await fetch('/api/test-connection', {
        method: 'POST'
      });
      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setResult({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-primary">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Teste Direto de Conexão</h1>
        
        <div className="card p-6">
          <div className="space-y-4">
            <button 
              onClick={testDirectConnection}
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Testando...' : 'Testar Conexão Direta'}
            </button>
            
            <button 
              onClick={testWithFetch}
              disabled={loading}
              className="btn btn-secondary"
            >
              Testar via API Route
            </button>
          </div>

          {result && (
            <div className="mt-8">
              <h2 className="font-bold mb-4">Resultado:</h2>
              <pre className="bg-tertiary p-4 rounded overflow-auto text-xs">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="card p-6 mt-8">
          <h2 className="font-bold mb-4">Possíveis Problemas:</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Projeto Supabase pausado (precisa acessar o dashboard)</li>
            <li>Problemas de CORS (verifique as configurações do Supabase)</li>
            <li>Firewall ou proxy bloqueando conexões</li>
            <li>Cache do navegador (tente limpar ou abrir aba anônima)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}