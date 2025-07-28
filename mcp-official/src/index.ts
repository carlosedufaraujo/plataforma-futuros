import { z } from 'zod';

interface Env {
  ENVIRONMENT: string;
  ALLOWED_ORIGINS: string;
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
}

// MCP Tool definitions
const tools = [
  {
    name: 'check-environment',
    description: 'Check environment variables and configuration',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'test-supabase',
    description: 'Test connection to Supabase',
    inputSchema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'check-pages-deployment',
    description: 'Get information about Cloudflare Pages deployment',
    inputSchema: {
      type: 'object',
      properties: {
        pagesUrl: {
          type: 'string',
          description: 'The URL of your Cloudflare Pages deployment'
        }
      },
      required: ['pagesUrl']
    }
  },
  {
    name: 'analyze-errors',
    description: 'Analyze common errors (401, 404) and suggest solutions',
    inputSchema: {
      type: 'object',
      properties: {
        errorCode: {
          type: 'number',
          description: 'The HTTP error code'
        },
        context: {
          type: 'string',
          description: 'Additional context about where the error occurred'
        }
      },
      required: ['errorCode']
    }
  },
  {
    name: 'list-routes',
    description: 'List all available routes and their status',
    inputSchema: {
      type: 'object',
      properties: {
        baseUrl: {
          type: 'string',
          description: 'Base URL to check routes'
        }
      },
      required: ['baseUrl']
    }
  }
];

// Tool handlers
async function handleTool(toolName: string, args: any, env: Env): Promise<any> {
  switch (toolName) {
    case 'check-environment':
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({
            ENVIRONMENT: env.ENVIRONMENT || 'NOT_SET',
            SUPABASE_URL: env.SUPABASE_URL ? '✅ Configured' : '❌ Not configured',
            SUPABASE_ANON_KEY: env.SUPABASE_ANON_KEY ? '✅ Configured' : '❌ Not configured',
            TIMESTAMP: new Date().toISOString()
          }, null, 2)
        }]
      };

    case 'test-supabase':
      if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
        return {
          content: [{
            type: 'text',
            text: 'Error: Supabase credentials not configured'
          }]
        };
      }

      try {
        const response = await fetch(`${env.SUPABASE_URL}/rest/v1/`, {
          headers: {
            'apikey': env.SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${env.SUPABASE_ANON_KEY}`
          }
        });

        return {
          content: [{
            type: 'text',
            text: `Supabase connection test:\nStatus: ${response.status}\nOK: ${response.ok}\nURL: ${env.SUPABASE_URL}`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `Error testing Supabase: ${error instanceof Error ? error.message : 'Unknown error'}`
          }]
        };
      }

    case 'check-pages-deployment':
      try {
        const { pagesUrl } = args;
        const response = await fetch(pagesUrl);
        const debugResponse = await fetch(`${pagesUrl}/debug/`);
        const diagnosticsResponse = await fetch(`${pagesUrl}/diagnostics/`);

        return {
          content: [{
            type: 'text',
            text: `Pages deployment check:
Main page: ${response.status} ${response.ok ? '✅' : '❌'}
Debug page: ${debugResponse.status} ${debugResponse.ok ? '✅' : '❌'}
Diagnostics page: ${diagnosticsResponse.status} ${diagnosticsResponse.ok ? '✅' : '❌'}`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text',
            text: `Error checking Pages: ${error instanceof Error ? error.message : 'Unknown error'}`
          }]
        };
      }

    case 'analyze-errors':
      const { errorCode, context } = args;
      let analysis = `Error ${errorCode} Analysis:\n\n`;

      switch (errorCode) {
        case 401:
          analysis += `401 Unauthorized - Authentication Error\n\n`;
          analysis += `Possible causes:\n`;
          analysis += `1. Supabase credentials not configured in environment variables\n`;
          analysis += `2. Expired or invalid API keys\n`;
          analysis += `3. CORS issues preventing authentication headers\n\n`;
          analysis += `Solutions:\n`;
          analysis += `- Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Cloudflare Pages\n`;
          analysis += `- Verify keys are correct and not expired\n`;
          analysis += `- Check browser console for CORS errors`;
          break;

        case 404:
          analysis += `404 Not Found - Page/Resource Error\n\n`;
          analysis += `Possible causes:\n`;
          analysis += `1. Next.js static export not generating pages correctly\n`;
          analysis += `2. Cloudflare Pages not serving the routes\n`;
          analysis += `3. Missing _redirects or incorrect routing configuration\n\n`;
          analysis += `Solutions:\n`;
          analysis += `- Ensure trailingSlash: true in next.config.mjs\n`;
          analysis += `- Check if pages exist in /out directory after build\n`;
          analysis += `- Verify _redirects file is in place\n`;
          analysis += `- Try accessing with trailing slash (e.g., /debug/)`;
          break;

        default:
          analysis += `General error analysis for code ${errorCode}`;
      }

      if (context) {
        analysis += `\n\nContext: ${context}`;
      }

      return {
        content: [{
          type: 'text',
          text: analysis
        }]
      };

    case 'list-routes':
      const { baseUrl } = args;
      const routes = [
        '/',
        '/debug',
        '/debug/',
        '/diagnostics',
        '/diagnostics/'
      ];

      const results = await Promise.all(
        routes.map(async (route) => {
          try {
            const response = await fetch(`${baseUrl}${route}`);
            return `${route}: ${response.status} ${response.ok ? '✅' : '❌'}`;
          } catch (error) {
            return `${route}: ❌ Error`;
          }
        })
      );

      return {
        content: [{
          type: 'text',
          text: `Route Status:\n${results.join('\n')}`
        }]
      };

    default:
      return {
        content: [{
          type: 'text',
          text: `Unknown tool: ${toolName}`
        }]
      };
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': env.ALLOWED_ORIGINS || '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Health check endpoint
    if (url.pathname === '/health') {
      return Response.json({
        status: 'ok',
        mcp_version: '1.0.0',
        timestamp: new Date().toISOString(),
        environment: env.ENVIRONMENT
      }, { headers: corsHeaders });
    }

    // MCP SSE endpoint
    if (url.pathname === '/sse') {
      // Create SSE response
      const { readable, writable } = new TransformStream();
      const writer = writable.getWriter();
      const encoder = new TextEncoder();

      // Send initial connection message
      writer.write(encoder.encode('data: {"type":"connection","data":{"name":"boi-gordo-diagnostics","version":"1.0.0"}}\n\n'));

      // Handle incoming messages
      (async () => {
        try {
          const reader = request.body?.getReader();
          if (!reader) return;

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const text = new TextDecoder().decode(value);
            const lines = text.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  
                  if (data.method === 'tools/list') {
                    const response = {
                      id: data.id,
                      result: { tools }
                    };
                    await writer.write(encoder.encode(`data: ${JSON.stringify(response)}\n\n`));
                  }
                  
                  if (data.method === 'tools/call') {
                    const result = await handleTool(data.params.name, data.params.arguments, env);
                    const response = {
                      id: data.id,
                      result
                    };
                    await writer.write(encoder.encode(`data: ${JSON.stringify(response)}\n\n`));
                  }
                } catch (e) {
                  console.error('Error processing message:', e);
                }
              }
            }
          }
        } catch (error) {
          console.error('SSE error:', error);
        } finally {
          writer.close();
        }
      })();

      return new Response(readable, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // Simple JSON-RPC endpoint for testing
    if (url.pathname === '/rpc' && request.method === 'POST') {
      try {
        const body = await request.json();
        
        if (body.method === 'tools/list') {
          return Response.json({
            jsonrpc: '2.0',
            id: body.id,
            result: { tools }
          }, { headers: corsHeaders });
        }
        
        if (body.method === 'tools/call') {
          const result = await handleTool(body.params.name, body.params.arguments, env);
          return Response.json({
            jsonrpc: '2.0',
            id: body.id,
            result
          }, { headers: corsHeaders });
        }
        
        return Response.json({
          jsonrpc: '2.0',
          id: body.id,
          error: { code: -32601, message: 'Method not found' }
        }, { headers: corsHeaders });
      } catch (error) {
        return Response.json({
          jsonrpc: '2.0',
          error: { code: -32700, message: 'Parse error' }
        }, { headers: corsHeaders, status: 400 });
      }
    }

    return new Response(`
MCP Server - Boi Gordo Diagnostics

Available endpoints:
- /health - Health check
- /sse - MCP SSE endpoint
- /rpc - JSON-RPC endpoint for testing

Available tools:
${tools.map(t => `- ${t.name}: ${t.description}`).join('\n')}
`, {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
    });
  },
};