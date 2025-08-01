import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

export default function AuthLayout({ 
  children 
}: { 
  children: ReactNode 
}) {
  return <>{children}</>;
}