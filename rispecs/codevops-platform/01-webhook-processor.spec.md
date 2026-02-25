# Webhook Processor

> GitHub webhook event processing and narrative ETL pipeline.

## Desired Outcome
mia-code-server receives GitHub webhook events (push, PR, issue, review) and transforms them into narrative events — feeding the story engine with real development activity.

## Current Reality
code-server does not process webhooks. Miadi platform has a partially-working GitHub ETL pipeline.

## Structural Tension
Automated event ingestion transforms routine development into living narrative.

---

## Components

### WebhookEndpoint
HTTP endpoint for GitHub webhook delivery.
- **Behavior:** Registers route `POST /api/webhooks/github`. Validates webhook signature using `WEBHOOK_SECRET`. Parses event type from `X-GitHub-Event` header. Dispatches to event-specific handlers. Returns 200 immediately, processes asynchronously. Logs receipt to narrative system.

### EventTransformer
Transforms GitHub events into narrative events.
- **Behavior:** Maps GitHub event types to narrative event types:
  | GitHub Event | Narrative Type | Example |
  |-------------|---------------|---------|
  | `push` | `code-evolution` | "3 files evolved in feature branch" |
  | `pull_request.opened` | `collaboration-request` | "PR #42: New validation engine" |
  | `pull_request.merged` | `integration-milestone` | "Feature merged into main" |
  | `issues.opened` | `tension-identified` | "Issue: Memory leak in processor" |
  | `pull_request_review` | `peer-reflection` | "Review: Approved with suggestions" |
  Each transformation includes three-universe analysis of the event significance.

### EventQueue
Async queue for webhook processing.
- **Behavior:** Incoming webhooks queued immediately. Background workers process queue. Failed events retried with exponential backoff. Dead letter queue for persistent failures. Queue size visible in health endpoint.

---

## Supporting Structures
- Route registered via `MiaModule` (see `mia-server-core/02-server-extension-api.spec.md`)
- Events stored via narrative memory (see `narrative-intelligence/01-narrative-memory.spec.md`)
- GitHub App or webhook secret for authentication
