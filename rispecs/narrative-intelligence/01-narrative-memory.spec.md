# Narrative Memory

> Spiral memory architecture for persistent narrative context.

## Desired Outcome
The platform maintains a spiral memory — where narrative context (beats, analyses, charts, observations) accumulates and deepens over time, enabling the system to draw on rich historical context for increasingly insightful analysis.

## Current Reality
Miadi has a `Memory_Spiral_Architecture.spec.md` in rispecs. miadi-code has session-based memory. Redis-backed in Miadi platform.

## Structural Tension
Memory without structure becomes noise; spiral memory creates natural deepening of understanding.

---

## Components

### MemoryStore
Key-value store with metadata and TTL support.
- **Behavior:** Stores narrative memories as key-value pairs with metadata (universe, type, timestamp, session, relevance score). Supports TTL for ephemeral memories. Search by key pattern, metadata filter, or semantic similarity. Two backends: file-based (default) and Redis (optional).
- **Data:**
  ```typescript
  interface MemoryEntry {
    key: string;
    value: unknown;
    metadata: {
      type: 'beat' | 'analysis' | 'chart' | 'observation' | 'decision' | 'custom';
      universe?: string;
      session: string;
      workspace?: string;
      relevance: number; // 0-1, decays over time
      tags: string[];
    };
    createdAt: string;
    expiresAt?: string;
    accessCount: number;
    lastAccessed: string;
  }
  ```

### SpiralLayer
Organizes memories into concentric layers of significance.
- **Behavior:** Memories naturally move through layers based on access frequency and relevance: Active (current session, high relevance), Recent (last 7 days, moderate relevance), Deep (older, proven relevance), Archive (low access, preserved but not actively surfaced). Each layer has different retrieval priority and storage optimization.

### MemoryRetriever
Retrieves relevant memories for context building.
- **Behavior:** Given current context (file, workspace, active chart), retrieves most relevant memories across all layers. Uses combination of recency, access frequency, and semantic similarity. Returns ranked list with relevance scores. Configurable max results and minimum relevance threshold.

### MemoryDecay
Natural relevance decay over time.
- **Behavior:** Memory relevance scores decay logarithmically over time. Accessed memories get relevance boost. Memories referenced in active charts maintain high relevance. Decay rate configurable. Memories below minimum relevance archived but not deleted.

---

## Supporting Structures
- File backend: JSON files in `~/.local/share/mia-code-server/memory/`
- Redis backend: Upstash Redis compatible (from Miadi platform)
- Memory cleanup runs on configurable schedule
