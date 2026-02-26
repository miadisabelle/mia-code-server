# Workspace API

> HTTP endpoints exposing workspace lifecycle operations through the server.

## Desired Outcome
The server provides RESTful endpoints under `/api/workspace/` that expose workspace lifecycle operations — creating workspaces, progressing through phases, editing specifications and plans, and generating code — enabling both the IDE frontend and external tools (including MCP clients) to drive the creative development process.

## Current Reality
No workspace management API exists. The narrative routes (`mia-server-core/03-narrative-routes.spec.md`) expose analysis but not lifecycle management.

## Structural Tension
The workspace lifecycle engine needs HTTP accessibility for IDE webviews, CLI tools, and MCP integration to drive the creative development process.

---

## Components

### WorkspaceRouter
Express router mounting all workspace API routes.
- **Behavior:** Mounted at `/api/workspace/`. Requires authentication (same as code-server auth). Returns JSON responses. Emits events on the module bus for each operation. Supports pagination for list endpoints.

### WorkspaceCRUD
Basic workspace management endpoints.
- **Behavior:**
  | Method | Path | Description |
  |--------|------|-------------|
  | `POST` | `/api/workspace/` | Create workspace from task description |
  | `GET` | `/api/workspace/` | List all workspaces (with filters) |
  | `GET` | `/api/workspace/:id` | Get workspace details |
  | `PATCH` | `/api/workspace/:id` | Update workspace metadata |
  | `DELETE` | `/api/workspace/:id` | Archive/delete workspace |
  | `POST` | `/api/workspace/:id/fork` | Fork workspace from current state |
- **Data:**
  ```typescript
  // POST /api/workspace/
  interface CreateWorkspaceRequest {
    task: string;
    source?: 'natural-language' | 'github-issue' | 'pde-decomposition';
    sourceId?: string;
    repository?: { owner: string; repo: string; branch?: string };
  }

  // GET /api/workspace/?status=germinating&phase=spec
  interface ListWorkspacesQuery {
    status?: string;
    phase?: string;
    limit?: number;
    offset?: number;
    sort?: 'created' | 'updated';
  }
  ```

### PhaseTransitionEndpoints
Endpoints for progressing through workspace phases.
- **Behavior:**
  | Method | Path | Description |
  |--------|------|-------------|
  | `POST` | `/api/workspace/:id/phase/spec` | Generate specification from task |
  | `POST` | `/api/workspace/:id/phase/plan` | Generate plan from specification |
  | `POST` | `/api/workspace/:id/phase/code` | Generate code from plan |
  | `POST` | `/api/workspace/:id/phase/validate` | Run validation checks |
  | `POST` | `/api/workspace/:id/phase/pr` | Create pull request |
  Each endpoint triggers AI generation for the target phase and advances the workspace. Supports streaming responses via Server-Sent Events for real-time progress.

### SpecificationEndpoints
Endpoints for editing workspace specifications (interactive STC).
- **Behavior:**
  | Method | Path | Description |
  |--------|------|-------------|
  | `GET` | `/api/workspace/:id/spec` | Get current specification |
  | `PUT` | `/api/workspace/:id/spec` | Replace entire specification |
  | `POST` | `/api/workspace/:id/spec/current-reality` | Add current reality item |
  | `POST` | `/api/workspace/:id/spec/desired-outcome` | Add desired outcome item |
  | `PATCH` | `/api/workspace/:id/spec/items/:itemId` | Edit spec item |
  | `DELETE` | `/api/workspace/:id/spec/items/:itemId` | Remove spec item |
  | `POST` | `/api/workspace/:id/spec/regenerate` | Regenerate spec from task |

### PlanEndpoints
Endpoints for editing implementation plans.
- **Behavior:**
  | Method | Path | Description |
  |--------|------|-------------|
  | `GET` | `/api/workspace/:id/plan` | Get current plan |
  | `POST` | `/api/workspace/:id/plan/files` | Add file to plan |
  | `PATCH` | `/api/workspace/:id/plan/files/:fileId` | Edit file actions |
  | `DELETE` | `/api/workspace/:id/plan/files/:fileId` | Remove file from plan |
  | `POST` | `/api/workspace/:id/plan/regenerate` | Regenerate plan from spec |

### VersionHistoryEndpoints
Endpoints for workspace version history.
- **Behavior:**
  | Method | Path | Description |
  |--------|------|-------------|
  | `GET` | `/api/workspace/:id/history` | List version history |
  | `GET` | `/api/workspace/:id/history/:versionId` | Get specific version |
  | `POST` | `/api/workspace/:id/undo` | Undo last change |
  | `POST` | `/api/workspace/:id/redo` | Redo undone change |

---

## Supporting Structures
- Delegates to workspace lifecycle engine (`codevops-platform/07-workspace-lifecycle.spec.md`)
- Pipeline operations delegate to (`codevops-platform/08-spec-plan-code-pipeline.spec.md`)
- Routes registered via module API (`mia-server-core/02-server-extension-api.spec.md`)
- Authentication via (`mia-server-core/06-authentication-extension.spec.md`)
- Also exposed as MCP tools via (`mia-server-core/09-mcp-server-integration.spec.md`)
