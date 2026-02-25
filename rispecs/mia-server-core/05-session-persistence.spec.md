# Session Persistence

> IDE session state enhanced with narrative context for continuity across connections.

## Desired Outcome
When a developer reconnects to mia-code-server, their narrative context — active STC charts, story position, universe focus, session memory — resumes naturally alongside the VS Code workspace state.

## Current Reality
code-server persists VS Code workspace state. No narrative session context is preserved.

## Structural Tension
Creative development sessions carry narrative momentum that disappears on disconnect, breaking the advancing pattern.

---

## Components

### NarrativeSessionStore
Persistent store for narrative session data.
- **Behavior:** Each authenticated user has a narrative session keyed by user + workspace. Session data serialized to JSON and stored in `~/.local/share/mia-code-server/sessions/`. Sessions auto-save every 30 seconds and on disconnect. Session includes active charts, current universe focus, story beats, memory keys, and conversation history.
- **Data:**
  ```typescript
  interface NarrativeSession {
    id: string;
    userId: string;
    workspaceId: string;
    createdAt: string;
    updatedAt: string;
    universFocus: 'engineer' | 'ceremony' | 'story' | 'all';
    activeCharts: STCChart[];
    storyPosition: { arc: string; beat: number; phase: string };
    memory: Record<string, unknown>;
    conversationHistory: ConversationEntry[];
    config: Record<string, unknown>;
  }
  ```

### SessionRestoration
Restores narrative context on reconnection.
- **Behavior:** When client connects via WebSocket, server loads the matching narrative session and sends initial state. Client renders universe panels, chart status, and story position from restored data. New sessions created automatically for first-time workspace access.

### SessionMerge
Handles concurrent session access.
- **Behavior:** When multiple tabs/windows access same workspace, sessions merge using last-write-wins for simple values and append-only for charts and beats. Conflict resolution uses timestamps. Clients notified of merge events.

---

## Supporting Structures
- File-based storage for simplicity (Redis adapter optional via config)
- Compatible with code-server's existing `xdg-basedir` and `env-paths` usage
- Session cleanup for sessions older than configurable TTL (default 30 days)
