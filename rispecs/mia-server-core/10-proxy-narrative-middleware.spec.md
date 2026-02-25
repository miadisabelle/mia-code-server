# Proxy Narrative Middleware

> Proxy middleware that injects narrative context into proxied requests.

## Desired Outcome
When mia-code-server proxies requests to VS Code or other backends, narrative context headers are injected — enabling downstream services to participate in the narrative trace.

## Current Reality
code-server has HTTP proxy functionality at `src/node/proxy.ts` with no context enrichment.

## Structural Tension
Narrative tracing across the full request lifecycle requires context propagation through the proxy layer.

---

## Components

### NarrativeContextInjector
Middleware adding narrative headers to proxied requests.
- **Behavior:** For authenticated requests, injects `X-Narrative-Trace-Id`, `X-Session-Id`, `X-Universe-Focus`, and `X-Narrative-Version` headers. Headers propagate through proxy to VS Code backend. Opt-in per-route configuration.
- **Data:**
  ```typescript
  interface NarrativeHeaders {
    'X-Narrative-Trace-Id': string;
    'X-Session-Id': string;
    'X-Universe-Focus': string;
    'X-Narrative-Version': string;
  }
  ```

### ResponseAnnotator
Annotates proxied responses with narrative metadata.
- **Behavior:** Optionally adds `X-Narrative-Processed` header to responses indicating narrative context was active. Logs response timing for telemetry. Does not modify response body.

---

## Supporting Structures
- Extends `src/node/proxy.ts` without replacing its functionality
- Header injection follows miaco cross-system correlation pattern
- Configurable via `narrative.proxy.inject-headers: true/false`
