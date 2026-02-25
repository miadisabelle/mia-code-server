# PDE MCP Server

> Exposes PDE as an MCP (Model Context Protocol) server.

## Desired Outcome
The PDE engine is accessible as an MCP server — enabling any MCP-compatible AI client to decompose prompts, retrieve decompositions, and generate workflows through the standardized protocol.

## Current Reality
PDE exists as standalone MCP tool. Needs integration into mia-code-server.

## Structural Tension
MCP protocol exposure makes PDE universally accessible to AI tooling.

---

## Components

### PDEToolProvider
MCP tool definitions for PDE operations.
- **Behavior:** Registers MCP tools:
  | Tool | Parameters | Returns |
  |------|-----------|---------|
  | `pde_decompose` | `prompt: string, options?: object` | Decomposition system prompt + user message |
  | `pde_parse_response` | `llm_response: string, original_prompt: string` | Stored DecompositionResult |
  | `pde_get` | `id: string` | Stored DecompositionResult |
  | `pde_list` | `limit?: number` | Array of decomposition summaries |
  | `pde_export_markdown` | `id: string` | Markdown document with Four Directions headers |
  | `pde_generate_workflow` | `id: string` | Executable workflow YAML |

### PDEResourceProvider
MCP resource access to decomposition storage.
- **Behavior:** Exposes `.pde/` directory contents as MCP resources. Resources listed by decomposition ID. Each resource includes full DecompositionResult JSON. Resource URIs: `pde://decompositions/{id}`.

### PDEPromptProvider
MCP prompt templates for PDE operations.
- **Behavior:** Provides reusable MCP prompts: `decompose-prompt` (structured decomposition), `balance-check` (Four Directions balance), `workflow-plan` (execution planning). Prompts include system instructions for structured output.

---

## Supporting Structures
- MCP server integration via `mia-server-core/09-mcp-server-integration.spec.md`
- Storage in `.pde/` directory within workspace
- Compatible with existing `mcp-pde` tool protocol
