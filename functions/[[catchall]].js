// Cloudflare Pages Functions - Roteamento para SPA
export async function onRequest(context) {
  // Lista de rotas conhecidas do app
  const knownRoutes = ['/', '/debug', '/diagnostics'];
  const url = new URL(context.request.url);
  const pathname = url.pathname;
  
  // Se for uma rota conhecida sem trailing slash, redirecionar
  if (knownRoutes.includes(pathname) && !pathname.endsWith('/')) {
    return Response.redirect(url.origin + pathname + '/', 301);
  }
  
  // Para assets estáticos, deixar passar
  if (pathname.includes('/_next/') || 
      pathname.endsWith('.js') || 
      pathname.endsWith('.css') || 
      pathname.endsWith('.png') || 
      pathname.endsWith('.jpg') || 
      pathname.endsWith('.svg') ||
      pathname.endsWith('.ico')) {
    return context.next();
  }
  
  try {
    // Tentar servir o arquivo correspondente
    const response = await context.next();
    
    // Se encontrou o arquivo, retornar
    if (response.status !== 404) {
      return response;
    }
    
    // Para rotas conhecidas, tentar servir o index.html da pasta
    if (pathname.startsWith('/debug')) {
      const debugResponse = await context.env.ASSETS.fetch(url.origin + '/debug/index.html');
      if (debugResponse.status === 200) {
        return new Response(debugResponse.body, {
          status: 200,
          headers: {
            'content-type': 'text/html;charset=UTF-8',
          },
        });
      }
    }
    
    if (pathname.startsWith('/diagnostics')) {
      const diagResponse = await context.env.ASSETS.fetch(url.origin + '/diagnostics/index.html');
      if (diagResponse.status === 200) {
        return new Response(diagResponse.body, {
          status: 200,
          headers: {
            'content-type': 'text/html;charset=UTF-8',
          },
        });
      }
    }
    
    // Fallback para index.html (SPA)
    const indexResponse = await context.env.ASSETS.fetch(url.origin + '/index.html');
    return new Response(indexResponse.body, {
      status: 200,
      headers: {
        'content-type': 'text/html;charset=UTF-8',
      },
    });
  } catch (e) {
    // Em caso de erro, tentar servir index.html
    return context.env.ASSETS.fetch(url.origin + '/index.html');
  }
}