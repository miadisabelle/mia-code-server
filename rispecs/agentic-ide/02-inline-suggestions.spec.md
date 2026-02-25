# Inline Suggestions

> Three-universe inline code suggestions in the editor.

## Desired Outcome
As developers write code, the three-universe system provides inline suggestions that go beyond syntax completion — offering engineering best practices, relational considerations, and narrative coherence hints directly in the editor.

## Current Reality
VS Code has built-in IntelliSense. No three-universe awareness in inline suggestions.

## Structural Tension
Contextual multi-perspective feedback at the point of creation enables natural quality advancement.

---

## Components

### ThreeUniverseCompletionProvider
VS Code inline completion provider with universe awareness.
- **Behavior:** Implements `vscode.InlineCompletionItemProvider`. On typing pause (debounced 1s), sends current line context to universe processor with `quick` depth. Returns suggestions as ghost text. Engineer suggestions for code quality. Story suggestions for documentation/comments. Ceremony suggestions for accessibility/inclusivity. Configurable: enable/disable per universe, trigger delay.
- **Data:**
  ```typescript
  interface UniverseSuggestion {
    text: string;
    universe: 'engineer' | 'ceremony' | 'story';
    confidence: number;
    range: vscode.Range;
    explanation?: string;
  }
  ```

### SuggestionPrioritizer
Selects best suggestion from multiple universes.
- **Behavior:** When multiple universes suggest different completions, prioritizer selects based on: context relevance, confidence score, user preference history. Only one inline suggestion shown at a time. User can cycle through alternatives with keyboard shortcut.

### SuggestionFeedback
Tracks acceptance/rejection of suggestions.
- **Behavior:** Records which suggestions are accepted, dismissed, or ignored. Adjusts future suggestion frequency and universe weights based on feedback. Data stored locally in session. Used to improve suggestion relevance over time.

---

## Supporting Structures
- VS Code `InlineCompletionItemProvider` API
- Debouncing prevents excessive API calls
- Suggestions cached per-file-position with short TTL
- Opt-in feature, disabled by default for performance
