'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export default function TestAdminPage() {
  const { user } = useAuth();
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    testAdminAccess();
  }, [user]);

  const testAdminAccess = async () => {
    const tests: any = {};
    
    try {
      // 1. Verificar usuário atual
      tests.currentUser = {
        id: user?.id,
        nome: user?.nome,
        email: user?.email,
        role: user?.role || 'NÃO DEFINIDO'
      };

      // 2. Verificar sessão
      const { data: { session } } = await supabase.auth.getSession();
      tests.session = {
        exists: !!session,
        userId: session?.user?.id,
        email: session?.user?.email
      };

      // 3. Testar query em users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, nome, email, role')
        .limit(5);
      
      tests.usersQuery = {
        success: !usersError,
        error: usersError?.message,
        count: usersData?.length || 0,
        data: usersData
      };

      // 4. Testar se consegue ver todos os usuários (admin)
      const { data: allUsers, error: allUsersError } = await supabase
        .from('users')
        .select('*');
      
      tests.allUsersAccess = {
        success: !allUsersError,
        error: allUsersError?.message,
        count: allUsers?.length || 0
      };

      // 5. Testar positions
      const { data: positions, error: positionsError } = await supabase
        .from('positions')
        .select('*')
        .limit(5);
      
      tests.positionsQuery = {
        success: !positionsError,
        error: positionsError?.message,
        count: positions?.length || 0
      };

      // 6. Verificar role no banco
      if (user?.id) {
        const { data: dbUser, error: dbError } = await supabase
          .from('users')
          .select('id, role')
          .eq('id', user.id)
          .single();
        
        tests.databaseRole = {
          success: !dbError,
          error: dbError?.message,
          role: dbUser?.role
        };
      }

    } catch (err: any) {
      tests.generalError = err.message;
    }

    setResults(tests);
    setLoading(false);
  };

  if (loading) {
    return <div className="p-8">Carregando testes...</div>;
  }

  return (
    <div className="min-h-screen p-8 bg-primary">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Teste de Acesso Admin</h1>
        
        <div className="space-y-6">
          {Object.entries(results).map(([key, value]) => (
            <div key={key} className="card p-6">
              <h3 className="font-bold text-lg mb-4">{key}</h3>
              <pre className="bg-tertiary p-4 rounded overflow-auto text-xs">
                {JSON.stringify(value, null, 2)}
              </pre>
            </div>
          ))}
        </div>

        <div className="card p-6 mt-8">
          <h3 className="font-bold mb-4">Próximos Passos:</h3>
          <ol className="list-decimal list-inside space-y-2">
            <li>Se o role aparecer como "NÃO DEFINIDO", faça logout e login novamente</li>
            <li>Se não conseguir ver todos os usuários, verifique as políticas RLS</li>
            <li>O role deve ser "admin" para Carlos Eduardo</li>
          </ol>
        </div>
      </div>
    </div>
  );
}