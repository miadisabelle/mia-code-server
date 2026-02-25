# Cross-System Correlation

> Trace correlation headers enabling unified observability across distributed narrative systems.

## Desired Outcome
All narrative operations carry correlation headers that link traces across mia-code-server, Langfuse, Miadi webhooks, and LangChain/LangGraph pipelines — enabling end-to-end visibility of narrative development workflows.

## Current Reality
miaco generates correlation headers for CLI operations. Headers are not propagated through the server stack.

## Structural Tension
Distributed narrative intelligence requires unified trace visibility to maintain coherence.

---

## Components

### CorrelationManager
Generates and propagates correlation context.
- **Behavior:** On each narrative operation, generates or inherits a `traceId`. Maintains context chain: `traceId` → `spanId` → `parentSpanId`. Context stored in async local storage for automatic propagation through the call stack. Outgoing HTTP requests automatically receive correlation headers.
- **Data:**
  ```typescript
  interface CorrelationContext {
    traceId: string;
    spanId: string;
    parentSpanId?: string;
    sessionId: string;
    storyId?: string;
    universe?: string;
    source: string;  // 'mia-code-server', 'miaco', 'miadi-code'
  }
  ```

### HeaderInjector
Injects correlation headers into outgoing requests.
- **Behavior:** HTTP client wrapper that automatically adds `X-Narrative-Trace-Id`, `X-Session-Id`, `X-Story-Id`, `X-Span-Id` to all outgoing requests. Compatible with standard OpenTelemetry trace propagation format.

### HeaderExtractor
Extracts correlation context from incoming requests.
- **Behavior:** Middleware that reads correlation headers from incoming requests and establishes the local context. Supports both miaco custom headers and W3C Trace Context format.

---

## Supporting Structures
- Built on Node.js `AsyncLocalStorage` for automatic propagation
- Compatible with OpenTelemetry W3C Trace Context
- Langfuse trace IDs mapped bidirectionally
