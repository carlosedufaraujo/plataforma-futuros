'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Auth route error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8 bg-secondary rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold">
            Oops! Algo deu errado
          </h2>
          <p className="mt-2 text-sm text-secondary">
            {error.message || 'Ocorreu um erro ao carregar esta página'}
          </p>
          <div className="mt-6 space-y-3">
            <button
              onClick={reset}
              className="w-full btn btn-primary"
            >
              Tentar novamente
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="w-full btn btn-secondary"
            >
              Voltar ao início
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}