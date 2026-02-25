# MCP Server Integration

> Model Context Protocol server embedded in mia-code-server.

## Desired Outcome
mia-code-server acts as an MCP server, exposing its narrative intelligence capabilities as MCP tools that any MCP-compatible AI client (Claude Desktop, Cursor, etc.) can invoke — enabling external AI agents to interact with the development platform.

## Current Reality
MCP integration exists in Miadi platform as a separate endpoint. code-server has no MCP awareness.

## Structural Tension
The narrative intelligence platform becomes more powerful when external AI agents can participate in the creative development process.

---

## Components

### MCPServerEndpoint
MCP protocol handler within the server.
- **Behavior:** Mounted at `/api/mcp`. Implements MCP protocol for tool discovery, tool invocation, and resource listing. Exposes narrative tools: `analyze_three_universe`, `create_stc_chart`, `add_chart_action`, `complete_action`, `create_beat`, `decompose_prompt`, `search_memory`. Each tool has typed input/output schemas.
- **Data:**
  ```typescript
  const mcpTools = [
    {
      name: 'analyze_three_universe',
      description: 'Analyze text through Engineer, Ceremony, and Story lenses',
      inputSchema: { type: 'object', properties: { text: { type: 'string' }, universes: { type: 'array' } } }
    },
    {
      name: 'create_stc_chart',
      description: 'Create a Structural Tension Chart with desired outcome and current reality',
      inputSchema: { type: 'object', properties: { outcome: { type: 'string' }, reality: { type: 'string' } } }
    },
    {
      name: 'decompose_prompt',
      description: 'Decompose a complex prompt into structured intents using PDE',
      inputSchema: { type: 'object', properties: { prompt: { type: 'string' } } }
    }
    // ... additional tools
  ];
  ```

### MCPResourceProvider
Exposes narrative data as MCP resources.
- **Behavior:** Lists active STC charts, recent beats, and session memory as browsable MCP resources. Resources have URIs following pattern `mia://charts/{id}`, `mia://beats/{id}`, `mia://memory/{key}`.

### MCPAuthentication
Authentication for MCP connections.
- **Behavior:** MCP connections authenticated via bearer token generated from server config. Token generated on first setup and stored in config. Separate from web UI password auth.

---

## Supporting Structures
- Uses `@modelcontextprotocol/sdk` from miadi-code dependency
- Protocol compatible with Claude Desktop, Cursor, and other MCP clients
- Tools map directly to `NarrativeRouter` endpoints internally
