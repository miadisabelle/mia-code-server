# COAIA Narrative Adapter

> Integration with coaia-narrative MCP for structural tension and narrative memory.

## Desired Outcome
The mia-code-server seamlessly connects to coaia-narrative — a Model Context Protocol service providing structural tension chart management and narrative memory operations — enabling rich narrative intelligence without reimplementing core narrative logic.

## Current Reality
miadi-code depends on `coaia-narrative` npm package and `coaia-visualizer`. MCP client code exists.

## Structural Tension
External narrative services provide deeper capabilities than server-embedded implementations.

---

## Components

### COAIAClient
MCP client connecting to coaia-narrative service.
- **Behavior:** Connects to coaia-narrative MCP server (local or remote). Discovers available tools: chart operations, memory operations, narrative analysis. Caches tool schemas for validation. Handles reconnection on connection loss. Falls back to local implementations when service unavailable.
- **Data:**
  ```typescript
  interface COAIAConnection {
    url: string;
    protocol: 'mcp' | 'http';
    status: 'connected' | 'disconnected' | 'reconnecting';
    availableTools: MCPTool[];
    lastHeartbeat: string;
  }
  ```

### ChartBridge
Bridges local STC charts with coaia-narrative chart service.
- **Behavior:** When coaia-narrative is available, chart operations delegate to the service. Local chart state synchronized bidirectionally. Service provides enhanced chart analysis (tension dynamics visualization, completion predictions). Service unavailability falls back to local chart management.

### MemoryBridge
Bridges local memory with coaia-narrative memory service.
- **Behavior:** Critical memories synchronized to coaia-narrative for persistence across sessions and devices. Service provides semantic search capabilities. Local memory serves as primary with service as backup/enrichment.

### VisualizerIntegration
Connects to coaia-visualizer for chart rendering.
- **Behavior:** When `coaia-visualizer` package is available, chart visualizations use its rendering engine. Supports terminal ASCII, SVG, and web-based interactive visualizations. Falls back to built-in simple visualization when package unavailable.

---

## Supporting Structures
- Uses `@modelcontextprotocol/sdk` for MCP client connection
- coaia-narrative as optional peer dependency
- Graceful degradation: all features work without external service
