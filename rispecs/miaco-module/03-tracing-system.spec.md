# Tracing System

> Session tracing with Langfuse integration for narrative observability.

## Desired Outcome
Every narrative operation (analysis, chart update, beat creation) is traced with structured spans, enabling developers to observe and improve their creative development workflow over time.

## Current Reality
miaco provides CLI tracing (`miaco trace start/log/end/list/view/correlation`). Langfuse integration exists in miadi-code.

## Structural Tension
Observable creative processes naturally improve through feedback, making tracing essential infrastructure.

---

## Components

### TraceManager
Manages trace lifecycle for narrative sessions.
- **Behavior:** `start(sessionId, storyId)` begins a trace. `log(event, data)` adds span to current trace. `end(exportPath?)` finalizes and optionally exports trace. Active trace automatically attached to all narrative operations within the session. Traces have unique IDs for cross-system correlation.
- **Data:**
  ```typescript
  interface NarrativeTrace {
    id: string;
    sessionId: string;
    storyId?: string;
    startedAt: string;
    endedAt?: string;
    spans: TraceSpan[];
    metadata: Record<string, unknown>;
  }
  interface TraceSpan {
    id: string;
    parentId?: string;
    name: string;
    event: string;
    startTime: string;
    endTime?: string;
    data: Record<string, unknown>;
    universe?: 'engineer' | 'ceremony' | 'story';
  }
  ```

### LangfuseAdapter
Pushes traces to Langfuse for external observability.
- **Behavior:** When Langfuse is configured, traces are automatically pushed as Langfuse traces with generations, spans, and scores. Maps narrative universe analysis to Langfuse generations. Maps STC chart operations to Langfuse spans. Coherence scores mapped to Langfuse scores. Adapter is optional — tracing works without Langfuse using local storage.

### CorrelationHeaders
Cross-system trace correlation.
- **Behavior:** Generates correlation headers for narrative trace propagation across systems. Headers follow miaco pattern: `X-Narrative-Trace-Id`, `X-Session-Id`, `X-Story-Id`. Injected into outgoing HTTP requests and WebSocket messages.
- **Data:**
  ```typescript
  interface CorrelationHeaders {
    'X-Narrative-Trace-Id': string;
    'X-Session-Id': string;
    'X-Story-Id'?: string;
  }
  ```

### TraceViewer
Retrieves and formats trace data for inspection.
- **Behavior:** Lists traces with filtering (session, date range, story). Views individual trace as timeline or tree. Exports trace to JSON or Markdown. Integrates with IDE output channel for inline viewing.

---

## Supporting Structures
- Uses `langfuse` npm package from miadi-code dependencies
- Adapter pattern allows swapping backends (Langfuse, local file, console)
- Traces auto-cleanup after configurable retention period
