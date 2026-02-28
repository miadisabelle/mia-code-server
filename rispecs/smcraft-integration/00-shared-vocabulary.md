# Shared Vocabulary — smcraft ↔ mia-code-server

> Rosetta Stone mapping state machine concepts to creative process concepts.

## Purpose

This document maps concepts between **smcraft** (State Machine Craft) and **mia-code-server** (Narrative CoDevOps Platform) to ensure both repos speak a shared language and their specifications can cross-reference without ambiguity.

---

## Concept Mapping

| smcraft Concept | mia-code-server Concept | Notes |
|----------------|------------------------|-------|
| `StateDef` | `WorkspacePhase` / creative process phase | A state represents a phase in the creative process |
| `StateDef.states[]` (composite) | Phase sub-states (e.g., Germination contains {task, spec, pde}) | Hierarchical nesting maps to sub-phases |
| `TransitionDef` | `PhaseTransition` | Movement between creative phases |
| `TransitionDef.event` | `NarrativeEvent` / action-step completion | Events that trigger advancement |
| `TransitionDef.condition` (guard) | Structural tension evaluation | Guards check if tension resolution conditions are met |
| `ActionDef` | `WorkflowStep` / strategic secondary choice | Actions executed on entry/exit/transition |
| `EventDef` | Narrative event type | Typed events in the creative process |
| `EventSourceDef` | Event source (user, AI, system) | Where events originate |
| `StateMachineDefinition` | `Workspace` lifecycle definition | The complete creative process definition |
| `ParallelDef` | Concurrent workflow branches | Parallel creative streams |
| `StateKindType: "final"` | `WorkspacePhase: 'complete'` | Terminal/resolved states |
| `StateKindType: "history"` | Session memory / narrative continuity | Resume from last active sub-state |
| `onEntry` actions | Phase initialization | Setup when entering a creative phase |
| `onExit` actions | Phase cleanup / beat generation | Narrative beat generated on phase exit |
| `TimerDef` | Time-based triggers (deadlines, review windows) | e.g., PDE sleep timer, review period |
| `SettingsModel.context` | `NarrativeArc` + `UniverseContext` | The context object holding creative process state |

## Conceptual Bridges

### Structural Tension = Disequilibrium = State Machine Energy

The fundamental insight: **Structural Tension Charts (STC) ARE state machines.**

- **Current Reality** = current state
- **Desired Outcome** = desired state (final state)
- **Action Steps** = transitions (each action-step completion is an event that triggers a state transition)
- **Tension** = the disequilibrium energy that drives the machine forward
- **Resolution** = reaching the final state (desired outcome achieved)

This is not metaphor — it is structural equivalence. Robert Fritz's creative process maps 1:1 to finite state automata with hierarchical composition.

### The Three Phases as Composite States

```
Root (Creative Process)
├── Germination (composite)
│   ├── TaskDefinition (sub-state)
│   ├── SpecGeneration (sub-state)
│   └── PDEDecomposition (sub-state)
├── Assimilation (composite)
│   ├── PlanGeneration (sub-state)
│   ├── CodeImplementation (sub-state)
│   └── IterativeRefinement (sub-state)
└── Completion (composite)
    ├── Validation (sub-state)
    ├── Review (sub-state)
    └── Integration (sub-state)
```

### Event-Driven Architecture

Creative orientation IS event-driven architecture:
- **`action_step_completed`** → state transition toward desired outcome
- **`tension_established`** → disequilibrium created (machine energized)
- **`reality_updated`** → current state reassessed
- **`phase_advanced`** → composite state exit → next phase entry
- **`workspace_forked`** → parallel state machine spawned

---

## Cross-Reference Index

| smcraft spec | mia-code-server spec | Integration point |
|-------------|---------------------|-------------------|
| smcraft/rispecs/70-smdf-format | codevops-platform/07-workspace-lifecycle | WorkspaceEntity status maps to SMDF states |
| smcraft/rispecs/71-runtime-engine | codevops-platform/02-workflow-engine | Workflow execution as state machine runtime |
| smcraft/rispecs/72-code-generator | pde-engine/03-workflow-generation | Generated workflows from state machine definitions |
| smcraft/rispecs/73-mcp-server | mia-server-core/09-mcp-server-integration | MCP tool bridging |
| smcraft/rispecs/74-web-designer | agentic-ide/01-agent-panel | Visual designer as IDE webview |

---

**RISE Framework Compliance**: ✅ Creative Orientation | ✅ Structural Dynamics | ✅ Advancing Patterns
