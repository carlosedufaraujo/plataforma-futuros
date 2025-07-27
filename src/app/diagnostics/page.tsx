'use client';

import { useState, useEffect } from 'react';
import { getMCPClient } from '@/lib/mcp-client';

export default function DiagnosticsPage() {
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const mcpClient = getMCPClient();

  // Auto-run diagnostics on load
  useEffect(() => {
    if (mcpClient) {
      runHealthCheck();
    }
  }, []);

  const runHealthCheck = async () => {
    if (!mcpClient) return;
    
    setLoading(prev => ({ ...prev, health: true }));
    try {
      const result = await mcpClient.health();
      setResults(prev => ({ ...prev, health: result }));
    } catch (error) {
      setResults(prev => ({ ...prev, health: { error: error instanceof Error ? error.message : 'Failed' } }));
    } finally {
      setLoading(prev => ({ ...prev, health: false }));
    }
  };

  const runEnvDiagnostics = async () => {
    if (!mcpClient) return;
    
    setLoading(prev => ({ ...prev, env: true }));
    try {
      const result = await mcpClient.getEnvDiagnostics();
      setResults(prev => ({ ...prev, env: result }));
    } catch (error) {
      setResults(prev => ({ ...prev, env: { error: error instanceof Error ? error.message : 'Failed' } }));
    } finally {
      setLoading(prev => ({ ...prev, env: false }));
    }
  };

  const runSupabaseTest = async () => {
    if (!mcpClient) return;
    
    setLoading(prev => ({ ...prev, supabase: true }));
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
      const result = await mcpClient.testSupabaseConnection(url, key);
      setResults(prev => ({ ...prev, supabase: result }));
    } catch (error) {
      setResults(prev => ({ ...prev, supabase: { error: error instanceof Error ? error.message : 'Failed' } }));
    } finally {
      setLoading(prev => ({ ...prev, supabase: false }));
    }
  };

  const runPagesInfo = async () => {
    if (!mcpClient) return;
    
    setLoading(prev => ({ ...prev, pages: true }));
    try {
      const result = await mcpClient.getPagesInfo();
      setResults(prev => ({ ...prev, pages: result }));
    } catch (error) {
      setResults(prev => ({ ...prev, pages: { error: error instanceof Error ? error.message : 'Failed' } }));
    } finally {
      setLoading(prev => ({ ...prev, pages: false }));
    }
  };

  const runAllTests = async () => {
    await Promise.all([
      runHealthCheck(),
      runEnvDiagnostics(),
      runSupabaseTest(),
      runPagesInfo()
    ]);
  };

  const testCommands = [
    { id: 'health', name: 'MCP Health Check', action: runHealthCheck },
    { id: 'env', name: 'Environment Variables', action: runEnvDiagnostics },
    { id: 'supabase', name: 'Supabase Connection', action: runSupabaseTest },
    { id: 'pages', name: 'Pages Deployment Info', action: runPagesInfo },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Sistema de Diagnóstico Avançado</h1>
        
        {/* MCP Status */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Status do MCP</h2>
          <div className="flex items-center gap-4">
            <div className={`w-4 h-4 rounded-full ${mcpClient ? 'bg-green-500' : 'bg-red-500'}`} />
            <span>{mcpClient ? 'MCP Client Configurado' : 'MCP Client Não Disponível'}</span>
            {mcpClient && (
              <button
                onClick={runAllTests}
                className="ml-auto bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
              >
                Executar Todos os Testes
              </button>
            )}
          </div>
        </div>

        {/* Test Controls */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {testCommands.map(test => (
            <div key={test.id} className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{test.name}</h3>
                <button
                  onClick={test.action}
                  disabled={loading[test.id] || !mcpClient}
                  className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-900 px-3 py-1 rounded text-sm"
                >
                  {loading[test.id] ? 'Testing...' : 'Run Test'}
                </button>
              </div>
              {results[test.id] && (
                <div className="mt-2">
                  <div className={`text-sm ${results[test.id].error ? 'text-red-400' : 'text-green-400'}`}>
                    {results[test.id].error ? '❌ Failed' : '✅ Success'}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Results Display */}
        {Object.keys(results).length > 0 && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Resultados dos Testes</h2>
            <div className="space-y-4">
              {Object.entries(results).map(([key, value]) => (
                <div key={key} className="border-t border-gray-700 pt-4 first:border-0 first:pt-0">
                  <h3 className="font-semibold mb-2 capitalize">{key} Test Results:</h3>
                  <pre className="bg-gray-900 p-4 rounded overflow-x-auto text-sm">
                    {JSON.stringify(value, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Status Summary */}
        <div className="mt-6 bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Resumo Rápido</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">MCP URL:</span>
              <span className="ml-2">{process.env.NEXT_PUBLIC_MCP_URL || 'Not configured'}</span>
            </div>
            <div>
              <span className="text-gray-400">Supabase URL:</span>
              <span className="ml-2">{process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Configured' : '❌ Not configured'}</span>
            </div>
            <div>
              <span className="text-gray-400">Environment:</span>
              <span className="ml-2">{process.env.NODE_ENV}</span>
            </div>
            <div>
              <span className="text-gray-400">Build Time:</span>
              <span className="ml-2">{new Date().toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}