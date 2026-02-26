# Steerable Decomposition

> PDE as interactive germination engine — users edit, refine, and regenerate decompositions at any layer.

## Desired Outcome
PDE decompositions are not one-shot artifacts but **living documents** in the germination phase of the creative process. Users steer the decomposition by editing intents, adjusting directions, reordering the action stack, and triggering selective regeneration — transforming PDE from an analysis tool into a creative germination engine.

## Current Reality
PDE produces a `DecompositionResult` as a static snapshot. Users cannot interactively refine individual layers without re-decomposing the entire prompt. The `.pde/` markdown export is read-only output.

## Structural Tension
The tension between static decomposition and interactive germination naturally resolves toward a steerable PDE where each layer is independently editable and regenerable.

---

## Conceptual Bridge: PDE ↔ Creative Process Germination

The germination phase of Fritz's creative process requires:
1. **Vision development** — clarifying what you want to create (→ PDE primary intent)
2. **Structural tension establishment** — seeing current reality clearly (→ PDE context analysis)
3. **Balance between planning and action** — not over-planning (→ PDE action stack as living document)

GitHub Copilot Workspace's Task→Spec phase was essentially this germination process automated. PDE already does the analysis — steerable decomposition makes it interactive and iterative, matching the creative process requirement of "creating and adjusting."

---

## Components

### SteerableDecomposition
Extended decomposition that supports interactive editing.
- **Data:**
  ```typescript
  interface SteerableDecomposition extends DecompositionResult {
    steerableState: {
      phase: 'initial' | 'user-editing' | 'regenerating' | 'finalized';
      editHistory: DecompositionEdit[];
      stalenessMap: Record<string, boolean>;
      lockedLayers: string[];
    };
  }

  interface DecompositionEdit {
    timestamp: string;
    layer: 'primary' | 'secondary' | 'directions' | 'actionStack' | 'context';
    operation: 'add' | 'edit' | 'remove' | 'reorder';
    path: string;
    previousValue: unknown;
    newValue: unknown;
  }
  ```
- **Behavior:** When user edits any layer (e.g., changes primary intent), downstream layers are marked as stale. User chooses whether to regenerate stale layers or keep manual overrides. Locked layers are preserved during regeneration. Edit history enables undo/redo.

### LayerRegenerator
Selective regeneration of individual decomposition layers.
- **Behavior:** When primary intent changes → secondary intents, directions, and action stack become stale. When a secondary intent is added/removed → action stack and directions may need update. User triggers regeneration per-layer: "Regenerate action stack from current intents." Regeneration preserves locked items and user-added items (marked `addedBy: 'user'`). Uses same LLM prompts as initial decomposition but with edited context.

### DecompositionToWorkspace
Bridges PDE output to Workspace Lifecycle creation.
- **Behavior:** `finalize()` method converts a SteerableDecomposition into a Workspace seed:
  - Primary intent → TaskDefinition.description
  - Primary intent → TaskDefinition.creativeIntent
  - East direction items → WorkspaceSpecification.desiredOutcome seeds
  - South direction items → context for current reality analysis
  - Action stack → ImplementationPlan seed
  - Four Directions balance → NarrativeArc.tensionLevel initial
  This bridges `pde-engine` to `codevops-platform/07-workspace-lifecycle.spec.md`.

### InteractiveMarkdownEditor
The `.pde/*.md` export becomes a bidirectional document.
- **Behavior:** Markdown file is both output AND input. User edits the markdown (checkboxes, text changes, reordering). On save, changes are parsed back into the DecompositionResult JSON. Supports: checking off action items, editing intent descriptions, adding new items with `+ ` prefix, removing items by deleting lines. File watcher detects changes and syncs to JSON representation.

### GerminationMetrics
Tracks the health of the germination process.
- **Behavior:** Measures: time spent in germination (too long = over-planning risk), number of edits (engagement indicator), direction balance (Four Directions equilibrium), intent clarity (confidence score trends). Warns if germination stalls or becomes imbalanced. Suggests transition to assimilation when decomposition stabilizes.

---

## MCP Tool Extensions

Extends `pde-engine/04-pde-mcp-server.spec.md` with:

| Tool | Parameters | Returns |
|------|-----------|---------|
| `pde_edit` | `id: string, edits: DecompositionEdit[]` | Updated DecompositionResult |
| `pde_regenerate_layer` | `id: string, layer: string` | Regenerated layer content |
| `pde_finalize` | `id: string` | Workspace seed object |
| `pde_lock_layer` | `id: string, layer: string` | Confirmation |
| `pde_staleness` | `id: string` | Map of stale layers |

---

## Supporting Structures
- Builds on `pde-engine/01-decomposition-core.spec.md` DecompositionResult
- Outputs feed into `codevops-platform/07-workspace-lifecycle.spec.md`
- Markdown sync connects to `miaco-module/07-workspace-sync.spec.md` pattern
- Germination metrics feed `narrative-intelligence/05-live-story-monitor.spec.md`
