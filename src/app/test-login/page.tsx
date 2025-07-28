'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testLogin = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        setResult({ error: error.message, details: error });
      } else {
        setResult({ success: true, user: data.user });
      }
    } catch (err: any) {
      setResult({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setResult({ session });
  };

  const resetPassword = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'http://localhost:3000/reset-password',
      });
      
      if (error) {
        setResult({ error: error.message });
      } else {
        setResult({ success: true, message: 'Email de reset enviado!' });
      }
    } catch (err: any) {
      setResult({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-primary">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Teste de Login</h1>
        
        <div className="card p-6 space-y-4">
          <div>
            <label className="block mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input w-full"
              placeholder="seu@email.com"
            />
          </div>
          
          <div>
            <label className="block mb-2">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input w-full"
              placeholder="Sua senha"
            />
          </div>
          
          <div className="flex gap-4">
            <button 
              onClick={testLogin}
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Testando...' : 'Testar Login'}
            </button>
            
            <button 
              onClick={checkAuth}
              className="btn btn-secondary"
            >
              Verificar Sessão
            </button>
            
            <button 
              onClick={resetPassword}
              disabled={!email || loading}
              className="btn btn-secondary"
            >
              Reset Senha
            </button>
          </div>
        </div>

        {result && (
          <div className="card p-6 mt-8">
            <h2 className="font-bold mb-4">Resultado:</h2>
            <pre className="bg-tertiary p-4 rounded overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}

        <div className="card p-6 mt-8">
          <h2 className="font-bold mb-4">Credenciais de Teste:</h2>
          <p className="mb-2">
            <strong>Carlos Eduardo:</strong><br />
            Email: carloseduardo@acexcapital.com<br />
            Senha: Acex@2025
          </p>
          <p>
            <strong>Ângelo Caiado:</strong><br />
            Email: angelocaiado@rialmaagropecuaria.com.br<br />
            Senha: Rialma@2025
          </p>
        </div>
      </div>
    </div>
  );
}