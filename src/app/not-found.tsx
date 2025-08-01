import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-8 text-center">
        <div>
          <h2 className="mt-6 text-6xl font-extrabold text-white">404</h2>
          <h3 className="mt-2 text-3xl font-bold text-gray-300">
            Página não encontrada
          </h3>
          <p className="mt-2 text-sm text-gray-400">
            A página que você está procurando não existe.
          </p>
        </div>
        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  );
}