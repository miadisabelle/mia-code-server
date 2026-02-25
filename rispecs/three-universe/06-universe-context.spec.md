# Universe Context

> Context management across three-universe analysis sessions.

## Desired Outcome
Each universe lens receives rich, relevant context about the developer's current work — including file content, project state, active charts, previous analyses, and session history — enabling contextual rather than generic analysis.

## Current Reality
miadi-code passes basic context to LLM prompts. Context management is ad-hoc.

## Structural Tension
Contextual analysis produces dramatically better results than generic analysis.

---

## Components

### ContextBuilder
Assembles context object for universe analysis.
- **Behavior:** Gathers: current file content and language, workspace structure summary, git status and recent commits, active STC charts and their progress, recent story beats, session conversation history (last N entries), project metadata (package.json, dependencies). Context sized to fit within LLM token limits with priority-based truncation.
- **Data:**
  ```typescript
  interface UniverseContext {
    file: { path: string; language: string; content: string; selection?: string };
    workspace: { name: string; structure: string[]; framework?: string };
    git: { branch: string; recentCommits: string[]; status: string };
    charts: STCChart[];
    beats: StoryBeat[];
    history: ConversationEntry[];
    project: { name: string; description: string; dependencies: string[] };
  }
  ```

### ContextCache
Caches expensive context gathering operations.
- **Behavior:** Workspace structure, git history, and project metadata cached with TTL. File content always fresh. STC charts refreshed on change events. Cache invalidation on file save, git operations, or chart updates.

### ContextPrioritizer
Prioritizes context elements for token budget.
- **Behavior:** Given a max token budget, selects most relevant context elements. Current file content is highest priority. Active chart most relevant to current file is next. Recent beats and history truncated to fit. Workspace structure summarized rather than listed exhaustively.

---

## Supporting Structures
- Token counting using tiktoken or character-based estimation
- Context assembled per-request, not globally
- Workspace analysis runs in background on folder open
