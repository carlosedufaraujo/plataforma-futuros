'use client';

import { useState } from 'react';
import { PageType } from '@/types';
import AppLayout from '@/components/Layout/AppLayout';
import RentabilidadePage from '@/components/Pages/RentabilidadePage';
import PosicoesPage from '@/components/Pages/PosicoesPage';
import OpcoesPage from '@/components/Pages/OpcoesPage';
import TransacoesPage from '@/components/Pages/TransacoesPage';
import ConfiguracoesPage from '@/components/Pages/ConfiguracoesPage';

export default function Home() {
  const [currentPage, setCurrentPage] = useState<PageType>('rentabilidade');

  const renderPage = () => {
    switch (currentPage) {
      case 'rentabilidade':
        return <RentabilidadePage />;
      case 'posicoes':
        return <PosicoesPage />;
      case 'opcoes':
        return <OpcoesPage />;
      case 'transacoes':
        return <TransacoesPage />;
      case 'configuracoes':
        return <ConfiguracoesPage />;
      default:
        return <RentabilidadePage />;
    }
  };

  return (
    <AppLayout
      currentPage={currentPage}
      onPageChange={setCurrentPage}
    >
      {renderPage()}
    </AppLayout>
  );
} 