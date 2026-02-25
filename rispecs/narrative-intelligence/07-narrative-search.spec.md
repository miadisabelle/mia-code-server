# Narrative Search

> Semantic search across narrative memory, beats, and charts.

## Desired Outcome
Developers search their narrative history with natural language queries — finding relevant beats, chart actions, analysis results, and memory entries by meaning rather than exact keywords.

## Current Reality
Miadi has search capabilities for memory keys. No semantic search in the IDE.

## Structural Tension
Rich narrative data becomes overwhelming without effective search.

---

## Components

### SearchEngine
Unified search across narrative data types.
- **Behavior:** Accepts natural language query. Searches across: memory entries (key and value), story beats (description and annotations), STC charts (outcome, reality, actions), analysis results (cached assessments). Returns ranked results with relevance scores. Supports filters by type, date range, universe, and session.
- **Data:**
  ```typescript
  interface SearchQuery {
    text: string;
    filters?: {
      types?: ('beat' | 'chart' | 'memory' | 'analysis')[];
      universe?: string;
      dateRange?: { from: string; to: string };
      session?: string;
      minRelevance?: number;
    };
    limit?: number;
  }
  interface SearchResult {
    id: string;
    type: 'beat' | 'chart' | 'memory' | 'analysis';
    title: string;
    snippet: string;
    relevance: number;
    timestamp: string;
    universe?: string;
    source: string; // e.g., file path, session ID
  }
  ```

### TextMatcher
Keyword and fuzzy text matching.
- **Behavior:** Implements tokenized search with fuzzy matching. Supports quoted phrases for exact match. Boolean operators (AND, OR, NOT). Results ranked by TF-IDF-like scoring. Fast in-memory index rebuilt from narrative data.

### SearchResultRenderer
Renders search results in IDE.
- **Behavior:** Results displayed in VS Code QuickPick or dedicated search panel. Results show type icon, title, snippet with match highlighting, relevance score, and timestamp. Selecting a result navigates to the source (opens file, shows chart, displays beat).

---

## Supporting Structures
- In-memory search index — no external search service required
- Index rebuilt on startup from narrative data files
- Future extension point for vector-based semantic search
