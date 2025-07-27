import { Hono } from 'hono';
import { cors } from 'hono/cors';

type Bindings = {
  ALLOWED_ORIGINS: string;
  MCP_AUTH_TOKEN: string;
  NEXT_PUBLIC_SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// Configurar CORS
app.use('/*', async (c, next) => {
  const allowedOrigins = c.env.ALLOWED_ORIGINS?.split(',') || ['*'];
  return cors({
    origin: allowedOrigins,
    allowHeaders: ['Content-Type', 'Authorization', 'X-MCP-Token'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    exposeHeaders: ['Content-Length'],
    maxAge: 600,
    credentials: true,
  })(c, next);
});

// Middleware de autenticação
app.use('/api/*', async (c, next) => {
  const token = c.req.header('X-MCP-Token');
  if (token !== c.env.MCP_AUTH_TOKEN) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  await next();
});

// Endpoint de saúde
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: c.env.ENVIRONMENT || 'development'
  });
});

// Endpoint de diagnóstico de variáveis
app.get('/api/diagnostics/env', (c) => {
  return c.json({
    environment: {
      NEXT_PUBLIC_SUPABASE_URL: c.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT_SET',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: c.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 
        `${c.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20)}...` : 'NOT_SET',
      ALLOWED_ORIGINS: c.env.ALLOWED_ORIGINS || 'NOT_SET',
      ENVIRONMENT: c.env.ENVIRONMENT || 'NOT_SET'
    },
    headers: Object.fromEntries(c.req.raw.headers.entries()),
    url: c.req.url,
    method: c.req.method
  });
});

// Endpoint para testar conexão com Supabase
app.post('/api/diagnostics/supabase-test', async (c) => {
  const { url, key } = await c.req.json();
  
  if (!url || !key) {
    return c.json({ error: 'Missing url or key' }, 400);
  }

  try {
    const response = await fetch(`${url}/rest/v1/`, {
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`
      }
    });

    return c.json({
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      success: response.ok
    });
  } catch (error) {
    return c.json({
      error: 'Connection failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Endpoint para verificar Pages deployment
app.get('/api/diagnostics/pages-info', async (c) => {
  const deploymentId = c.req.header('CF-Pages-Deployment-Id');
  const branch = c.req.header('CF-Pages-Branch');
  
  return c.json({
    deployment: {
      id: deploymentId || 'NOT_AVAILABLE',
      branch: branch || 'NOT_AVAILABLE',
      url: c.req.url,
      timestamp: new Date().toISOString()
    },
    cf: {
      colo: c.req.raw.cf?.colo || 'UNKNOWN',
      country: c.req.raw.cf?.country || 'UNKNOWN',
      // @ts-ignore
      asn: c.req.raw.cf?.asn || 'UNKNOWN'
    }
  });
});

// Endpoint para logs e métricas
app.post('/api/logs', async (c) => {
  const body = await c.req.json();
  
  // Aqui você pode enviar para um serviço de logs ou KV
  console.log('MCP Log:', body);
  
  return c.json({
    received: true,
    timestamp: new Date().toISOString()
  });
});

// Endpoint para executar comandos de diagnóstico
app.post('/api/diagnostics/execute', async (c) => {
  const { command, params } = await c.req.json();
  
  switch (command) {
    case 'check-env':
      return c.json({
        result: {
          hasSupabaseUrl: !!c.env.NEXT_PUBLIC_SUPABASE_URL,
          hasSupabaseKey: !!c.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          environment: c.env.ENVIRONMENT
        }
      });
      
    case 'test-pages-api':
      // Testa se a aplicação Pages está respondendo
      try {
        const origin = c.req.header('Origin') || params?.url;
        if (!origin) {
          return c.json({ error: 'No origin URL provided' }, 400);
        }
        
        const response = await fetch(origin);
        return c.json({
          result: {
            status: response.status,
            ok: response.ok,
            headers: Object.fromEntries(response.headers.entries())
          }
        });
      } catch (error) {
        return c.json({
          error: 'Failed to connect to Pages',
          details: error instanceof Error ? error.message : 'Unknown error'
        }, 500);
      }
      
    default:
      return c.json({ error: 'Unknown command' }, 400);
  }
});

// Tratamento de erros
app.onError((err, c) => {
  console.error('MCP Server Error:', err);
  return c.json({
    error: 'Internal Server Error',
    message: err.message
  }, 500);
});

// 404 handler
app.notFound((c) => {
  return c.json({
    error: 'Not Found',
    path: c.req.path
  }, 404);
});

export default app;