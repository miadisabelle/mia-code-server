# Narrative Routes

> HTTP API endpoints exposing narrative intelligence services through the server.

## Desired Outcome
The server provides RESTful endpoints under `/api/narrative/` that expose three-universe analysis, structural tension charts, story beats, and narrative memory — enabling both the IDE frontend and external tools to access narrative intelligence.

## Current Reality
code-server exposes VS Code routes and proxy endpoints. No narrative API surface exists.

## Structural Tension
The Three-Universe analysis capabilities need HTTP accessibility for both the IDE webview and external integrations.

---

## Components

### NarrativeRouter
Express router mounting all narrative API routes.
- **Behavior:** Mounted at `/api/narrative/`. Requires authentication (same as code-server auth). Returns JSON responses. Supports pagination for list endpoints. Emits events on the module bus for each API call.
- **Layout:** Contains sub-routers for `universes`, `charts`, `beats`, `memory`, `sessions`

### UniverseAnalysisEndpoint
Analyzes input through three-universe lenses.
- **Behavior:** `POST /api/narrative/analyze` accepts `{ text: string, context?: object, universes?: string[] }`. Returns analysis from selected universes (defaults to all three). Response includes `engineer`, `ceremony`, `story` perspectives and a `synthesis` combining all three.
- **Data:**
  ```typescript
  interface AnalysisRequest {
    text: string;
    context?: { file?: string; language?: string; session?: string };
    universes?: ('engineer' | 'ceremony' | 'story')[];
  }
  interface AnalysisResponse {
    engineer?: { assessment: string; issues: Issue[]; score: number };
    ceremony?: { reflection: string; accountability: string; score: number };
    story?: { narrative: string; coherence: string; score: number };
    synthesis: { summary: string; overallScore: number };
  }
  ```

### ChartEndpoints
CRUD operations for Structural Tension Charts.
- **Behavior:**
  - `GET /api/narrative/charts` — List all charts for current session
  - `POST /api/narrative/charts` — Create chart with `{ outcome, reality }`
  - `GET /api/narrative/charts/:id` — Get chart details with action steps
  - `POST /api/narrative/charts/:id/actions` — Add action step
  - `PATCH /api/narrative/charts/:id/actions/:actionId` — Complete/update action
  - `GET /api/narrative/charts/:id/review` — Get chart review with tension analysis

### BeatEndpoints
Story beat creation and retrieval.
- **Behavior:**
  - `POST /api/narrative/beats` — Create beat with `{ description, type, context }`
  - `GET /api/narrative/beats` — List beats with optional filters (session, type, date range)
  - `GET /api/narrative/beats/:id` — Get beat details with three-universe annotations

### MemoryEndpoints
Narrative memory store operations.
- **Behavior:**
  - `POST /api/narrative/memory` — Store memory key with value, metadata, TTL
  - `GET /api/narrative/memory/:key` — Retrieve memory value
  - `GET /api/narrative/memory/search` — Search memories with query string
  - `DELETE /api/narrative/memory/:key` — Remove memory entry

---

## Supporting Structures
- All endpoints use the server's existing authentication middleware
- Rate limiting applied via existing `limiter` dependency
- Responses follow consistent `{ data, meta, errors }` envelope
- OpenAPI/Swagger documentation auto-generated from route definitions
