'use client';

export default function DebugPage() {
  const env = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT_SET',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 
      `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20)}...` : 'NOT_SET',
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'NOT_SET',
    NODE_ENV: process.env.NODE_ENV || 'NOT_SET'
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Debug - Variáveis de Ambiente</h1>
      
      <div className="bg-gray-800 rounded-lg p-6 max-w-4xl">
        <h2 className="text-xl font-semibold mb-4">Variáveis Carregadas:</h2>
        
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

        <div className="mt-6 p-4 bg-yellow-900 rounded">
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
    </div>
  );
}