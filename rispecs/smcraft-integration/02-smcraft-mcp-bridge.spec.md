# smcraft MCP Bridge

> Proxying smcraft's 11 MCP tools through mia-code-server's MCP endpoint, enabling state machine design within the creative workspace.

## Desired Outcome

mia-code-server's MCP endpoint (`/api/mcp`) exposes smcraft's full toolset alongside its own narrative tools — enabling any MCP-compatible AI client to design, validate, generate, and run state machines within the context of a creative workspace session.

## Current Reality

- mia-code-server has a designed MCP endpoint (`mia-server-core/09-mcp-server-integration.spec.md`) exposing 7 narrative tools
- smcraft has its own MCP server with 11 tools (design session, state/transition/event management, validation, code generation)
- The two MCP servers are separate processes with no bridging
- smcraft's MCP server runs in-memory design sessions (no persistence)

## Structural Tension

The tension between separate MCP servers and unified creative workspace resolves toward a bridge that lets AI agents design state machines and manage creative processes through a single MCP connection.

---

## Components

### MCPToolBridge

Proxies smcraft MCP tools through mia-code-server.

- **Behavior:** Registers smcraft's 11 tools under a `smcraft_` namespace prefix in the mia-code-server MCP tool registry. Tool invocations are forwarded to the smcraft MCP server (either in-process via TypeScript import, or via subprocess). Results are enriched with workspace context (which workspace the design belongs to, narrative beat generation). Tool registry synchronizes on startup — if smcraft adds tools, the bridge auto-discovers them.

- **Bridged Tools:**
  | smcraft Tool | Bridge Name | Workspace Integration |
  |-------------|-------------|----------------------|
  | `start_design_session` | `smcraft_start_design_session` | Links session to workspace ID |
  | `add_state` | `smcraft_add_state` | State additions fire workspace events |
  | `add_transition` | `smcraft_add_transition` | Transition additions update workspace plan |
  | `add_event` | `smcraft_add_event` | Event additions map to narrative events |
  | `validate_definition` | `smcraft_validate_definition` | Validation results shown in diagnostic panel |
  | `generate_code` | `smcraft_generate_code` | Uses real PythonCodeGenerator/TypeScriptCodeGenerator |
  | `get_definition` | `smcraft_get_definition` | Returns current SMDF as workspace artifact |
  | `update_state` | `smcraft_update_state` | State updates sync to workspace lifecycle |
  | `remove_state` | `smcraft_remove_state` | Removals tracked in workspace version history |
  | `add_timer` | `smcraft_add_timer` | Timers map to workspace review windows |
  | `get_session_status` | `smcraft_get_session_status` | Status includes workspace context |

### DesignSessionPersistence

Persists smcraft design sessions to workspace storage.

- **Behavior:** smcraft's in-memory sessions are backed by workspace persistence (`mia-server-core/05-session-persistence.spec.md`). On each design operation, the current SMDF is saved. On server restart, design sessions are restored from workspace state. Multiple workspaces can have independent design sessions.

### AuthenticationPassthrough

MCP authentication for bridged tools.

- **Behavior:** smcraft tools inherit mia-code-server's MCP authentication (`mia-server-core/06-authentication-extension.spec.md`). No separate auth for the bridge — if you can access `/api/mcp`, you can invoke smcraft tools. Per-workspace access control applies (users can only modify state machines in their own workspaces).

---

## Supporting Structures

- `mia-server-core/09-mcp-server-integration.spec.md` — base MCP server
- smcraft MCP server (11 tools) — the upstream tools being bridged
- `@modelcontextprotocol/sdk` for protocol handling
- Workspace persistence for design session storage

---

**RISE Framework Compliance**: ✅ Creative Orientation | ✅ Structural Dynamics | ✅ Advancing Patterns
