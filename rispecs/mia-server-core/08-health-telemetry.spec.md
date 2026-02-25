# Health & Telemetry

> Health checks and narrative telemetry reporting.

## Desired Outcome
The server exposes health endpoints reporting module status and optionally streams telemetry about narrative operations to Langfuse for observability.

## Current Reality
code-server has a basic health endpoint. No narrative telemetry.

## Structural Tension
Observable narrative operations enable continuous improvement of the creative development experience.

---

## Components

### HealthEndpoint
Extended health check including module status.
- **Behavior:** `GET /api/health` returns server status, uptime, and each registered module's health. Includes narrative session count, active chart count, and engine connectivity status.
- **Data:**
  ```typescript
  interface HealthResponse {
    status: 'healthy' | 'degraded' | 'unhealthy';
    uptime: number;
    version: string;
    modules: { name: string; status: string; version: string }[];
    narrative: {
      activeSessions: number;
      activeCharts: number;
      enginesAvailable: string[];
    };
  }
  ```

### NarrativeTelemetry
Telemetry adapter for narrative operations.
- **Behavior:** When tracing is enabled in config, narrative operations (analysis requests, chart operations, beat creation) are traced to Langfuse. Each operation gets a trace ID propagated through the system. Telemetry is opt-in and clearly documented.
- **Layout:** Adapter pattern — `TelemetryAdapter` interface with `LangfuseAdapter` and `NoopAdapter` implementations.

---

## Supporting Structures
- Uses existing `@coder/logger` for logging
- Langfuse client from miadi-code dependency patterns
- Trace correlation headers from miaco cross-system tracing
