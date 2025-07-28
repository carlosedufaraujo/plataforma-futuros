'use client';

export default function ApiTestPage() {
  const env = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT_SET',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'NOT_SET',
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>API Test Page</h1>
      <pre>{JSON.stringify(env, null, 2)}</pre>
      <p>Build Time: {new Date().toISOString()}</p>
    </div>
  );
}