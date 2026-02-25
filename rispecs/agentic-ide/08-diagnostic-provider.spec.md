# Diagnostic Provider

> Three-universe diagnostic messages in VS Code Problems panel.

## Desired Outcome
Three-universe analysis results surface as VS Code diagnostics — appearing in the Problems panel alongside TypeScript errors and lint warnings — enabling developers to address narrative concerns alongside technical ones.

## Current Reality
VS Code diagnostics show compiler and linter messages. No narrative diagnostics.

## Structural Tension
Narrative quality concerns visible in the standard diagnostic workflow become natural to address.

---

## Components

### NarrativeDiagnosticProvider
Maps universe analysis to VS Code diagnostics.
- **Behavior:** After file analysis, converts `TechnicalIssue` (engineer), relational concerns (ceremony), and coherence issues (story) into `vscode.Diagnostic` objects. Engineer issues: Error/Warning severity. Ceremony issues: Information severity. Story issues: Hint severity. Diagnostics tagged with universe source for filtering.
- **Data:**
  ```typescript
  interface NarrativeDiagnostic extends vscode.Diagnostic {
    universe: 'engineer' | 'ceremony' | 'story';
    category: string;
    suggestion?: string;
    relatedInformation?: vscode.DiagnosticRelatedInformation[];
  }
  ```

### DiagnosticCollection
Manages diagnostic lifecycle.
- **Behavior:** Creates `vscode.DiagnosticCollection` named `mia`. Diagnostics refreshed on file save (if auto-analysis enabled) or on manual analysis command. Old diagnostics cleared before new ones added. Diagnostics expire after configurable TTL if file changes without re-analysis.

### CodeActionProvider
Provides quick fixes for narrative diagnostics.
- **Behavior:** Implements `vscode.CodeActionProvider`. For engineer diagnostics: offers code fix suggestions. For ceremony diagnostics: offers comment additions or documentation. For story diagnostics: offers narrative beat creation or chart action. Actions marked as `preferred` when confidence is high.

---

## Supporting Structures
- VS Code Extension API: `vscode.languages.createDiagnosticCollection`
- Severity mapping: Engineer=Error/Warning, Ceremony=Info, Story=Hint
- Diagnostics filterable by universe in Problems panel
