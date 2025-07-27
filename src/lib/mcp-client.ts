// MCP Client para comunicação com o servidor de diagnóstico
export class MCPClient {
  private baseUrl: string;
  private authToken: string;

  constructor(baseUrl: string, authToken: string) {
    this.baseUrl = baseUrl;
    this.authToken = authToken;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'X-MCP-Token': this.authToken,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`MCP request failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Verificar saúde do servidor
  async health() {
    return this.request('/health');
  }

  // Obter diagnóstico de variáveis de ambiente
  async getEnvDiagnostics() {
    return this.request('/api/diagnostics/env');
  }

  // Testar conexão com Supabase
  async testSupabaseConnection(url: string, key: string) {
    return this.request('/api/diagnostics/supabase-test', {
      method: 'POST',
      body: JSON.stringify({ url, key }),
    });
  }

  // Obter informações do deployment Pages
  async getPagesInfo() {
    return this.request('/api/diagnostics/pages-info');
  }

  // Enviar logs
  async sendLog(data: any) {
    return this.request('/api/logs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Executar comando de diagnóstico
  async executeCommand(command: string, params?: any) {
    return this.request('/api/diagnostics/execute', {
      method: 'POST',
      body: JSON.stringify({ command, params }),
    });
  }
}

// Singleton instance
let mcpClient: MCPClient | null = null;

export function getMCPClient(): MCPClient | null {
  if (!mcpClient && typeof window !== 'undefined') {
    // Use variáveis de ambiente ou valores padrão
    const mcpUrl = process.env.NEXT_PUBLIC_MCP_URL || 'https://boi-gordo-mcp.workers.dev';
    const mcpToken = process.env.NEXT_PUBLIC_MCP_TOKEN || 'development-token';
    
    mcpClient = new MCPClient(mcpUrl, mcpToken);
  }
  
  return mcpClient;
}

// Hook para usar em componentes React
export function useMCPDiagnostics() {
  const client = getMCPClient();
  
  const runDiagnostics = async () => {
    if (!client) {
      console.error('MCP Client not available');
      return null;
    }

    try {
      const [health, env, pages] = await Promise.all([
        client.health(),
        client.getEnvDiagnostics(),
        client.getPagesInfo()
      ]);

      return {
        health,
        env,
        pages,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('MCP Diagnostics failed:', error);
      return null;
    }
  };

  return { runDiagnostics, client };
}