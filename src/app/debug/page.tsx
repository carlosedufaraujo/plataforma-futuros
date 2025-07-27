'use client';

import { useState, useEffect } from 'react';
import { useMCPDiagnostics } from '@/lib/mcp-client';

export default function DebugPage() {
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { runDiagnostics } = useMCPDiagnostics();

  const env = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT_SET',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 
      `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20)}...` : 'NOT_SET',
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'NOT_SET',
    NEXT_PUBLIC_MCP_URL: process.env.NEXT_PUBLIC_MCP_URL || 'NOT_SET',
    NODE_ENV: process.env.NODE_ENV || 'NOT_SET'
  };

  const runMCPDiagnostics = async () => {
    setLoading(true);
    try {
      const result = await runDiagnostics();
      setDiagnostics(result);
    } catch (error) {
      console.error('Failed to run MCP diagnostics:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Debug - Variáveis de Ambiente</h1>
      
      <div className="bg-gray-800 rounded-lg p-6 max-w-4xl mb-6">
        <h2 className="text-xl font-semibold mb-4">Variáveis Locais (Client-side):</h2>
        
        <pre className="bg-gray-900 p-4 rounded overflow-x-auto">
          {JSON.stringify(env, null, 2)}
        </pre>

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Status:</h3>
          <ul className="space-y-2">
            <li className={env.NEXT_PUBLIC_SUPABASE_URL !== 'NOT_SET' ? 'text-green-400' : 'text-red-400'}>
              SUPABASE_URL: {env.NEXT_PUBLIC_SUPABASE_URL !== 'NOT_SET' ? '✅ Configurada' : '❌ Não encontrada'}
            </li>
            <li className={env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'NOT_SET' ? 'text-green-400' : 'text-red-400'}>
              SUPABASE_ANON_KEY: {env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'NOT_SET' ? '✅ Configurada' : '❌ Não encontrada'}
            </li>
            <li className={env.NEXT_PUBLIC_API_URL !== 'NOT_SET' ? 'text-green-400' : 'text-red-400'}>
              API_URL: {env.NEXT_PUBLIC_API_URL !== 'NOT_SET' ? '✅ Configurada' : '❌ Não encontrada'}
            </li>
          </ul>
        </div>
      </div>

      {/* MCP Diagnostics Section */}
      <div className="bg-gray-800 rounded-lg p-6 max-w-4xl">
        <h2 className="text-xl font-semibold mb-4">MCP Server Diagnostics:</h2>
        
        <button
          onClick={runMCPDiagnostics}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-4 py-2 rounded mb-4"
        >
          {loading ? 'Running...' : 'Run MCP Diagnostics'}
        </button>

        {diagnostics && (
          <pre className="bg-gray-900 p-4 rounded overflow-x-auto">
            {JSON.stringify(diagnostics, null, 2)}
          </pre>
        )}
      </div>

      <div className="mt-6 p-4 bg-yellow-900 rounded max-w-4xl">
        <p className="text-yellow-200">
          ⚠️ Se as variáveis aparecem como NOT_SET, verifique no Cloudflare Pages:
        </p>
        <ol className="list-decimal list-inside mt-2 text-sm">
          <li>Settings → Environment variables</li>
          <li>Adicione as variáveis com o prefixo NEXT_PUBLIC_</li>
          <li>Faça um novo deploy após adicionar as variáveis</li>
        </ol>
      </div>
    </div>
  );
}