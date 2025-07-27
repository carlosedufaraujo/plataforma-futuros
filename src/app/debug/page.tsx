'use client';

import { useState } from 'react';

export default function DebugPage() {
  const [mcpResult, setMcpResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const env = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT_SET',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 
      `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20)}...` : 'NOT_SET',
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'NOT_SET',
    NEXT_PUBLIC_MCP_URL: process.env.NEXT_PUBLIC_MCP_URL || 'NOT_SET',
    NEXT_PUBLIC_MCP_TOKEN: process.env.NEXT_PUBLIC_MCP_TOKEN || 'NOT_SET',
    NODE_ENV: process.env.NODE_ENV || 'NOT_SET'
  };

  const testMCP = async () => {
    if (!process.env.NEXT_PUBLIC_MCP_URL || process.env.NEXT_PUBLIC_MCP_URL === 'NOT_SET') {
      setMcpResult({ error: 'MCP URL not configured' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_MCP_URL}/health`);
      const data = await response.json();
      setMcpResult(data);
    } catch (error) {
      setMcpResult({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Debug - Diagnóstico do Sistema</h1>
      
      {/* Variáveis de Ambiente */}
      <div className="bg-gray-800 rounded-lg p-6 max-w-4xl mb-6">
        <h2 className="text-xl font-semibold mb-4">1. Variáveis de Ambiente (Client-side):</h2>
        
        <div className="bg-gray-900 p-4 rounded font-mono text-sm">
          {Object.entries(env).map(([key, value]) => (
            <div key={key} className="mb-2">
              <span className="text-blue-400">{key}:</span>{' '}
              <span className={value !== 'NOT_SET' ? 'text-green-400' : 'text-red-400'}>
                {value}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="bg-gray-700 p-3 rounded">
            <h3 className="font-semibold mb-2">Supabase Status:</h3>
            <p className={env.NEXT_PUBLIC_SUPABASE_URL !== 'NOT_SET' ? 'text-green-400' : 'text-red-400'}>
              {env.NEXT_PUBLIC_SUPABASE_URL !== 'NOT_SET' ? '✅ Configurado' : '❌ Não configurado'}
            </p>
          </div>
          <div className="bg-gray-700 p-3 rounded">
            <h3 className="font-semibold mb-2">MCP Status:</h3>
            <p className={env.NEXT_PUBLIC_MCP_URL !== 'NOT_SET' ? 'text-green-400' : 'text-red-400'}>
              {env.NEXT_PUBLIC_MCP_URL !== 'NOT_SET' ? '✅ Configurado' : '❌ Não configurado'}
            </p>
          </div>
        </div>
      </div>

      {/* Teste MCP */}
      <div className="bg-gray-800 rounded-lg p-6 max-w-4xl mb-6">
        <h2 className="text-xl font-semibold mb-4">2. Teste de Conexão MCP:</h2>
        
        <button
          onClick={testMCP}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-4 py-2 rounded mb-4"
        >
          {loading ? 'Testando...' : 'Testar MCP Server'}
        </button>

        {mcpResult && (
          <pre className="bg-gray-900 p-4 rounded overflow-x-auto text-sm">
            {JSON.stringify(mcpResult, null, 2)}
          </pre>
        )}
      </div>

      {/* Informações do Sistema */}
      <div className="bg-gray-800 rounded-lg p-6 max-w-4xl">
        <h2 className="text-xl font-semibold mb-4">3. Informações do Sistema:</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold text-gray-400">URL atual:</h3>
            <p className="text-sm">{typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-400">User Agent:</h3>
            <p className="text-sm truncate">{typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Instruções */}
      <div className="mt-6 p-4 bg-yellow-900 rounded max-w-4xl">
        <h3 className="text-yellow-200 font-semibold mb-2">📋 Checklist de Configuração:</h3>
        <ol className="list-decimal list-inside text-sm space-y-1">
          <li>Configure as variáveis no Cloudflare Pages (Settings → Environment variables)</li>
          <li>Faça deploy do MCP server (cd mcp-server && wrangler deploy)</li>
          <li>Adicione NEXT_PUBLIC_MCP_URL e NEXT_PUBLIC_MCP_TOKEN no Pages</li>
          <li>Faça um novo deploy após adicionar as variáveis</li>
        </ol>
      </div>
    </div>
  );
}