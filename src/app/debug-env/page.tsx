'use client';

import { useEffect } from 'react';

export default function DebugEnvPage() {
  useEffect(() => {
    // Verificar variáveis de ambiente
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    console.log('🔍 DEBUG: Environment Variables');
    console.log('NEXT_PUBLIC_SUPABASE_URL:', url);
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY exists:', !!key);
    console.log('Key length:', key?.length);
    console.log('Key starts with:', key?.substring(0, 20));
    console.log('Key ends with:', key?.substring(key.length - 20));
    
    // Verificar se há espaços ou quebras de linha
    if (key) {
      console.log('Has spaces:', key.includes(' '));
      console.log('Has newlines:', key.includes('\n'));
      console.log('Has tabs:', key.includes('\t'));
      console.log('First char code:', key.charCodeAt(0));
      console.log('Last char code:', key.charCodeAt(key.length - 1));
    }
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Debug Environment Variables</h1>
      <p>Check the browser console for details (F12)</p>
      <hr />
      <h2>Current Values:</h2>
      <p><strong>URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT SET'}</p>
      <p><strong>Key exists:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'YES' : 'NO'}</p>
      <p><strong>Key length:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0}</p>
    </div>
  );
}