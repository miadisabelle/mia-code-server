# Validation Engine

> NCP, beat, coherence, and type validation for narrative data.

## Desired Outcome
All narrative data (NCP documents, story beats, coherence scores, TypeScript types) passes through a validation engine that ensures structural integrity and provides actionable feedback through the IDE diagnostic system.

## Current Reality
miaco provides CLI validation commands (`miaco validate ncp/beat/coherence/types`). Validation runs as terminal output.

## Structural Tension
Validation feedback surfaced directly in the IDE editor creates natural quality progression.

---

## Components

### NCPValidator
Validates Narrative Computing Protocol documents.
- **Behavior:** Accepts NCP JSON file path or content. Validates against NCP schema (story structure, character definitions, beat sequences). Supports `--strict` mode for production-ready validation. Returns list of issues with severity (error, warning, info), location, and suggested fix.
- **Data:**
  ```typescript
  interface ValidationResult {
    valid: boolean;
    issues: ValidationIssue[];
    summary: { errors: number; warnings: number; info: number };
  }
  interface ValidationIssue {
    severity: 'error' | 'warning' | 'info';
    message: string;
    path: string;       // JSON path to issue
    line?: number;       // Source file line if available
    rule: string;        // Validation rule that triggered
    suggestion?: string; // Suggested fix
  }
  ```

### BeatValidator
Validates story beat structure and content.
- **Behavior:** Checks beat has required fields (description, type, timestamp), validates beat type against known types, checks narrative continuity if previous beats provided. Returns validation result with contextual suggestions.

### CoherenceValidator
Validates narrative coherence across a session or story.
- **Behavior:** Analyzes a set of beats, characters, and story arcs for internal consistency. Checks for timeline contradictions, character behavior inconsistencies, unresolved plot threads. Uses three-universe lenses for comprehensive coherence analysis.

### TypeValidator
TypeScript type checking for narrative code.
- **Behavior:** Runs TypeScript compiler in check mode against project's narrative modules. Reports type errors with narrative context. Integrates with VS Code's built-in TypeScript diagnostics.

### ValidationPipeline
Orchestrates multiple validators in sequence.
- **Behavior:** Runs configured validators in order, aggregating results. Short-circuits on critical errors if configured. Supports custom validator plugins. Results pushed to IDE diagnostics panel.

---

## Supporting Structures
- Validators implement `Validator` interface for pipeline compatibility
- JSON Schema validation using standard library (no custom parser)
- Results mappable to VS Code `Diagnostic` objects for IDE integration
