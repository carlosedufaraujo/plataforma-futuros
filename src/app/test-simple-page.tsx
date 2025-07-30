export default function TestSimplePage() {
  return (
    <div style={{padding: '20px', backgroundColor: '#0f0f0f', color: 'white', minHeight: '100vh'}}>
      <h1>✅ TESTE SIMPLES FUNCIONANDO!</h1>
      <p>Se você está vendo esta página, o Next.js está funcionando.</p>
      <p>Timestamp: {new Date().toISOString()}</p>
      <div style={{marginTop: '20px'}}>
        <h2>Próximos passos:</h2>
        <ul>
          <li>O roteamento do App Router está funcionando</li>
          <li>O problema deve estar nos contextos ou componentes</li>
          <li>Vamos investigar as dependências</li>
        </ul>
      </div>
    </div>
  );
} 