'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function DebugAuthPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [supabaseStatus, setSupabaseStatus] = useState<'testing' | 'connected' | 'error'>('testing');

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(`🔍 DEBUG: ${message}`);
  };

  useEffect(() => {
    addLog('🚀 Iniciando teste de debug...');
    
    const testSupabase = async () => {
      try {
        addLog('📡 Testando conectividade com Supabase...');
        
        // Teste básico de conectividade
        const { data, error } = await supabase.from('contracts').select('count').limit(1);
        
        if (error) {
          addLog(`❌ Erro ao conectar com Supabase: ${error.message}`);
          setSupabaseStatus('error');
          return;
        }
        
        addLog('✅ Conectividade com Supabase OK');
        setSupabaseStatus('connected');
        
        // Teste de autenticação - verificar sessão atual
        addLog('🔑 Testando getSession...');
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          addLog(`❌ Erro em getSession: ${sessionError.message}`);
        } else {
          addLog(`✅ getSession OK: ${sessionData.session ? 'Sessão ativa' : 'Sem sessão'}`);
          if (sessionData.session) {
            addLog(`👤 User ID: ${sessionData.session.user.id}`);
            addLog(`📧 Email: ${sessionData.session.user.email}`);
          }
        }
        
        // Teste de acesso à tabela users
        if (sessionData.session) {
          addLog('👥 Testando acesso à tabela users...');
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', sessionData.session.user.id);
            
          if (userError) {
            addLog(`❌ Erro ao acessar users: ${userError.message}`);
          } else {
            addLog(`✅ Acesso à tabela users OK: ${userData?.length || 0} registros`);
            if (userData && userData.length > 0) {
              addLog(`📋 Dados do usuário: ${JSON.stringify(userData[0], null, 2)}`);
            }
          }
        }
        
      } catch (error: any) {
        addLog(`💥 Erro inesperado: ${error.message}`);
        setSupabaseStatus('error');
      }
    };
    
    // Delay para garantir que está tudo carregado
    setTimeout(testSupabase, 1000);
  }, []);

  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: '#0f0f0f', 
      color: 'white', 
      minHeight: '100vh',
      fontFamily: 'monospace'
    }}>
      <h1 style={{ color: '#00ff00', marginBottom: '20px' }}>
        🔍 DEBUG AUTH - BYPASS COMPLETO
      </h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Status Supabase:</h2>
        <div style={{
          padding: '10px',
          backgroundColor: supabaseStatus === 'connected' ? '#065f46' : 
                           supabaseStatus === 'error' ? '#991b1b' : '#1f2937',
          borderRadius: '5px',
          marginTop: '10px'
        }}>
          {supabaseStatus === 'testing' && '⏳ Testando...'}
          {supabaseStatus === 'connected' && '✅ Conectado'}
          {supabaseStatus === 'error' && '❌ Erro de Conexão'}
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>Informações do Sistema:</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li>🌐 URL: {process.env.NEXT_PUBLIC_SUPABASE_URL}</li>
          <li>🔑 Anon Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'NOT SET'}</li>
          <li>⏰ Timestamp: {new Date().toISOString()}</li>
          <li>🖥️ User Agent: {typeof window !== 'undefined' ? navigator.userAgent : 'SSR'}</li>
        </ul>
      </div>

      <div>
        <h2>Log de Debug:</h2>
        <div style={{
          backgroundColor: '#1f2937',
          padding: '15px',
          borderRadius: '5px',
          maxHeight: '400px',
          overflowY: 'auto',
          border: '1px solid #374151'
        }}>
          {logs.length === 0 ? (
            <div style={{ color: '#9ca3af' }}>Carregando logs...</div>
          ) : (
            logs.map((log, index) => (
              <div key={index} style={{ 
                marginBottom: '5px',
                color: log.includes('❌') ? '#ef4444' : 
                      log.includes('✅') ? '#10b981' : '#d1d5db'
              }}>
                {log}
              </div>
            ))
          )}
        </div>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#1f2937', borderRadius: '5px' }}>
        <h3>🎯 Próximos Passos:</h3>
        <ul>
          <li>1. Verifique os logs acima para identificar onde trava</li>
          <li>2. Se Supabase estiver OK, problema é no AuthContext</li>
          <li>3. Se Supabase der erro, problema é de conectividade/RLS</li>
          <li>4. Copie os logs e me informe o resultado</li>
        </ul>
      </div>
    </div>
  );
} 