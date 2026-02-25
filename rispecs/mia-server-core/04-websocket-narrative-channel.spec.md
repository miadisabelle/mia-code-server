# WebSocket Narrative Channel

> Real-time bidirectional streaming for narrative events between server and IDE.

## Desired Outcome
A WebSocket channel enables live streaming of three-universe analysis, STC updates, story beats, and agent messages between the server and the IDE frontend — enabling real-time narrative awareness during development.

## Current Reality
code-server uses WebSocket for VS Code's remote communication protocol. No narrative streaming exists.

## Structural Tension
Real-time narrative feedback during coding requires low-latency bidirectional communication beyond REST.

---

## Components

### NarrativeWebSocketRouter
WebSocket route handler for narrative events.
- **Behavior:** Listens on `/api/narrative/ws`. Authenticates using the same session/cookie as HTTP routes. Supports multiplexed channels within a single connection using message types. Heartbeat ping/pong for connection health. Automatic reconnection support.
- **Data:**
  ```typescript
  interface NarrativeMessage {
    type: 'universe-analysis' | 'stc-update' | 'beat-created' | 'agent-message' | 'session-event' | 'subscribe' | 'unsubscribe';
    channel?: string;
    payload: unknown;
    timestamp: string;
    traceId?: string;
  }
  ```

### ChannelSubscription
Pub/sub model for narrative event channels.
- **Behavior:** Clients send `{ type: 'subscribe', channel: 'stc:chart_123' }` to receive updates for specific charts, sessions, or event types. Multiple subscriptions per connection. Server pushes events matching subscribed channels. Unsubscribe removes channel filter.
- **Layout:** Channels follow pattern: `{domain}:{resource_id}` (e.g., `stc:chart_abc`, `beats:session_xyz`, `universe:all`)

### LiveAnalysisFeed
Stream of three-universe analysis as developer types.
- **Behavior:** When subscribed to `universe:live`, server debounces editor changes (500ms) and streams incremental analysis results. Each message contains the universe lens, analysis fragment, and confidence score. Client renders analysis in real-time panels.

### STCLiveUpdates
Live structural tension chart progress updates.
- **Behavior:** When chart actions are completed or observations added, subscribed clients receive immediate updates. Chart visualization components re-render without polling.

---

## Supporting Structures
- Built on existing `ws` dependency in code-server
- Integrates with `src/node/wsRouter.ts` pattern
- Message serialization uses JSON (compatible with existing WS infrastructure)
- Connection pooling for multi-tab scenarios
