# Boi Gordo MCP Official Server

Official Model Context Protocol (MCP) server for diagnosing and managing the Boi Gordo platform.

## Features

This MCP server provides the following diagnostic tools:

### 🔧 Available Tools

1. **check-environment**
   - Check all environment variables and configuration
   - No parameters required

2. **test-supabase**
   - Test connection to Supabase database
   - Validates credentials and connectivity

3. **check-pages-deployment**
   - Check Cloudflare Pages deployment status
   - Parameters: `pagesUrl` (your pages.dev URL)

4. **analyze-errors**
   - Analyze HTTP errors and provide solutions
   - Parameters: `errorCode` (401, 404, etc), `context` (optional)

5. **list-routes**
   - List all routes and their status
   - Parameters: `baseUrl` (your site URL)

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
Create `.dev.vars` for local development:
```
SUPABASE_URL=https://kdfevkbwohcajcwrqzor.supabase.co
SUPABASE_ANON_KEY=your-key-here
```

### 3. Run locally
```bash
npm start
```

The server will be available at `http://localhost:8787/sse`

### 4. Deploy to Cloudflare
```bash
npm run deploy
```

## Testing with MCP Inspector

1. Install and run MCP Inspector:
```bash
npx @modelcontextprotocol/inspector@latest
```

2. Connect to your MCP server:
   - Local: `http://localhost:8787/sse`
   - Production: `https://your-worker.workers.dev/sse`

3. Test the tools:
   - Click "List Tools" to see all available tools
   - Execute tools to diagnose your platform

## Integration with Claude Desktop

Add to your Claude Desktop config:
```json
{
  "mcpServers": {
    "boi-gordo": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://your-worker.workers.dev/sse"
      ]
    }
  }
}
```

## Example Tool Usage

Ask Claude:
- "Check the environment configuration"
- "Test if Supabase is working"
- "Check if debug and diagnostics pages are accessible at fb0cfd9c.plataforma-futuros.pages.dev"
- "Analyze why I'm getting a 404 error"
- "List all available routes"