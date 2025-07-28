'use client';

import AppWrapper from '@/components/Layout/AppWrapper';
import ProtectedRoute from '@/components/Auth/ProtectedRoute';

// Force rebuild: 2025-07-27 18:20
export default function HomePage() {
  return (
    <ProtectedRoute>
      <AppWrapper />
    </ProtectedRoute>
  );
}
