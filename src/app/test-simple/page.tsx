'use client';

import { useState } from 'react';

export default function TestSimplePage() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testDirectFetch = async () => {
    setLoading(true);
    setResult('Iniciando teste...\n');
    
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      setResult(prev => prev + `URL: ${url ? 'Encontrada' : 'NÃO ENCONTRADA'}\n`);
      setResult(prev => prev + `Key: ${key ? 'Encontrada' : 'NÃO ENCONTRADA'}\n\n`);
      
      if (!url || !key) {
        setResult(prev => prev + 'ERRO: Variáveis não configuradas!\n');
        setLoading(false);
        return;
      }
      
      // Teste 1: Fetch direto
      setResult(prev => prev + 'Testando fetch direto...\n');
      const response = await fetch(`${url}/rest/v1/`, {
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`
        }
      });
      
      setResult(prev => prev + `Status: ${response.status}\n`);
      setResult(prev => prev + `OK: ${response.ok}\n\n`);
      
      // Teste 2: Importar Supabase
      setResult(prev => prev + 'Importando cliente Supabase...\n');
      const { supabase } = await import('@/lib/supabase');
      setResult(prev => prev + 'Cliente importado!\n\n');
      
      // Teste 3: Query simples
      setResult(prev => prev + 'Fazendo query...\n');
      const { data, error } = await supabase
        .from('users')
        .select('email')
        .limit(1);
        
      if (error) {
        setResult(prev => prev + `Erro: ${error.message}\n`);
      } else {
        setResult(prev => prev + `Sucesso! Dados: ${JSON.stringify(data)}\n`);
      }
      
    } catch (err: any) {
      setResult(prev => prev + `\nERRO CAPTURADO: ${err.message}\n`);
      console.error('Erro completo:', err);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen p-8 bg-primary">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Teste Simples</h1>
        
        <div className="card p-6">
          <button 
            onClick={testDirectFetch}
            disabled={loading}
            className="btn btn-primary mb-4"
          >
            {loading ? 'Testando...' : 'Executar Teste'}
          </button>
          
          <pre className="bg-tertiary p-4 rounded whitespace-pre-wrap text-sm">
            {result || 'Clique no botão para iniciar...'}
          </pre>
        </div>
        
        <div className="card p-6 mt-8">
          <p>Este teste verifica:</p>
          <ul className="list-disc list-inside mt-2">
            <li>Se as variáveis de ambiente estão definidas</li>
            <li>Se consegue fazer fetch para o Supabase</li>
            <li>Se consegue importar o cliente</li>
            <li>Se consegue fazer uma query</li>
          </ul>
        </div>
      </div>
    </div>
  );
}