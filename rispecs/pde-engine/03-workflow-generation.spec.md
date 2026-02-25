# Workflow Generation

> Generates executable workflows from PDE decompositions.

## Desired Outcome
PDE decompositions automatically generate executable workflow definitions — transforming analysis into action with proper dependency ordering and narrative framing.

## Current Reality
PDE produces structured analysis. No automatic workflow generation.

## Structural Tension
Automatic workflow generation closes the gap between understanding and execution.

---

## Components

### WorkflowGenerator
Transforms DecompositionResult into executable workflow.
- **Behavior:** Takes DecompositionResult as input. Groups actions by dependency level. Creates workflow YAML (compatible with `codevops-platform/02-workflow-engine.spec.md`). Each action becomes a workflow step with: universe assignment, narrative beat template, dependencies from PDE dependency graph. Parallel actions placed in concurrent groups. Output is valid workflow YAML ready for execution.

### ActionMapper
Maps PDE actions to platform capabilities.
- **Behavior:** Maps abstract action descriptions to concrete platform operations: "create file" → file system operation, "run tests" → test runner, "analyze code" → three-universe analysis, "review changes" → PR workflow. Unknown actions flagged for manual mapping. Mapping registry extensible.

### NarrativeFramer
Wraps workflow steps in narrative context.
- **Behavior:** Generates narrative framing for each workflow step: beat templates from action descriptions, session intent from primary intents, completion narrative from desired outcome. Framing uses Creative Orientation language (not reactive).

---

## Supporting Structures
- Output compatible with workflow engine (see `codevops-platform/02-workflow-engine.spec.md`)
- Action registry maps to available server modules
- Generated workflows editable before execution
