'use client';

import { useState } from 'react';
import { PageType } from '@/types';
import AppLayout from '@/components/layouts/AppLayout';
import RentabilidadePage from '@/app/(auth)/RentabilidadePage';
import PosicoesPage from '@/app/(auth)/PosicoesPage';
import OpcoesPage from '@/app/(auth)/OpcoesPage';
import PerformancePage from '@/app/(auth)/PerformancePage';
import ConfiguracoesPage from '@/app/(auth)/ConfiguracoesPage';

export default function AppWrapper() {
  const [currentPage, setCurrentPage] = useState<PageType>('rentabilidade');
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  const renderPage = () => {
    switch (currentPage) {
      case 'rentabilidade':
        return <RentabilidadePage selectedPeriod={selectedPeriod} />;
      case 'posicoes':
        return <PosicoesPage selectedPeriod={selectedPeriod} />;
      case 'opcoes':
        return <OpcoesPage selectedPeriod={selectedPeriod} />;
      case 'performance':
        return <PerformancePage selectedPeriod={selectedPeriod} />;
      case 'configuracoes':
        return <ConfiguracoesPage />;
      default:
        return <RentabilidadePage selectedPeriod={selectedPeriod} />;
    }
  };

  return (
    <AppLayout
      currentPage={currentPage}
      onPageChange={setCurrentPage}
      selectedPeriod={selectedPeriod}
      onPeriodChange={setSelectedPeriod}
    >
      {renderPage()}
    </AppLayout>
  );
} 