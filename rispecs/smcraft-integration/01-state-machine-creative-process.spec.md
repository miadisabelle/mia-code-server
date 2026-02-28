# State Machine Driven Creative Process

> Structural Tension Charts as hierarchical state machines — every creative process IS a state machine driven by disequilibrium.

## Desired Outcome

The creative process (Germination → Assimilation → Completion) is formalized as an **smcraft hierarchical state machine definition** (SMDF). Each workspace session instantiates this state machine, with action-step completions as events that drive transitions toward the desired outcome (desired state). The STC is no longer a static chart — it is a **living, executable state machine** where structural tension IS the energy that drives state transitions.

## Current Reality

- Workspace lifecycle (`codevops-platform/07-workspace-lifecycle.spec.md`) defines phases as TypeScript enums but has no formal state machine backing
- STC charts (`llms-structural-tension-charts.txt`) describe action steps as "strategic secondary choices" but don't model them as state transitions
- smcraft exists with full SMDF format supporting composite states (`StateDef.states[]` recursion) but no creative process example
- The conceptual connection (STC = state machine) is recognized but not formalized

## Structural Tension

The tension between static phase tracking and dynamic state machine execution naturally resolves toward a system where creative process progression IS state machine execution — each action step completed IS an event, each phase IS a composite state, and structural tension IS the disequilibrium that makes the machine advance.

---

## The Core Insight: STC = State Machine

Robert Fritz's creative process and structural tension methodology map structurally to hierarchical state machines:

| Fritz Concept | State Machine Equivalent | Why |
|--------------|-------------------------|-----|
| Current Reality | Current State | Where the system IS right now |
| Desired Outcome | Desired State (final) | Where the system naturally advances toward |
| Structural Tension | Disequilibrium | The loaded energy that drives state transitions |
| Action Step | Transition trigger event | Completing an action step IS a state-changing event |
| Action Step (as telescoped STC) | Composite state with sub-states | Each action step has its own desired outcome = sub-state machine |
| Phase (Germination/Assimilation/Completion) | Composite state | Contains sub-states and internal transitions |
| Creator Moment of Truth | Guard condition evaluation | Review whether conditions allow transition |
| Advancing Pattern | Forward transition chain | States that build on each other toward resolution |
| Oscillating Pattern | Transition cycle | States that loop without advancing |

This is not analogy — it is **structural equivalence**.

---

## Components

### CreativeProcessSMDF

The canonical SMDF definition for the creative process.

- **Data:** See `examples/creative-process.smdf.json` for the full definition.
- **Behavior:** Loaded by smcraft runtime to instantiate a creative process state machine for each workspace. The root state contains three composite states (Germination, Assimilation, Completion), each with sub-states matching the workspace lifecycle phases. Events correspond to user actions, AI generation completions, and system evaluations. Guards check structural tension conditions (is the tension resolving forward, or oscillating?).

### STCStateAdapter

Bridges the existing STC chart model to smcraft state machine instances.

- **Behavior:** When a new STC chart is created via `coaia-narrative` or the mia-code-server API, an `STCStateAdapter` wraps it with a smcraft state machine instance. Action-step additions become state definitions. Action-step completions fire events that trigger transitions. Current reality updates inform guard conditions. The adapter ensures the STC chart and state machine remain synchronized — editing either updates both.

### WorkspaceStateMachine

The runtime instance of a creative process state machine for a workspace.

- **Data:**
  ```typescript
  interface WorkspaceStateMachine {
    workspaceId: string;
    definition: StateMachineDefinition;  // from smcraft
    currentState: string;                // active state path
    stcChartId: string;                  // linked STC chart
    tensionLevel: number;                // computed from state distance to final
    eventHistory: StateMachineEvent[];   // audit trail
  }
  ```
- **Behavior:** Created when a workspace enters germination. Receives events from workspace actions (user edits, AI generations, phase advances). Evaluates guard conditions against structural tension (is the action advancing or oscillating?). Fires transition actions that generate narrative beats. Provides `currentState` to the workspace UI for visualization.

### EventDrivenSTC

The event model connecting STC operations to state machine events.

- **Events:**
  | Event ID | Trigger | Effect |
  |----------|---------|--------|
  | `action_step_completed` | User marks action step done | Transition to next state in current phase |
  | `tension_established` | STC chart created with desired outcome + current reality | Machine energized — initial state entered |
  | `reality_updated` | Current reality reassessed | Guard conditions re-evaluated, may trigger transitions |
  | `phase_advance` | All sub-states in current phase resolved | Exit composite state → enter next phase |
  | `phase_retreat` | User returns to earlier phase | Re-enter previous composite state (history state) |
  | `ai_generate` | AI produces content (spec, plan, code) | Transition within current sub-state |
  | `user_edit` | Human edits any artifact | May trigger guard re-evaluation |
  | `tension_resolve` | Desired outcome achieved | Final state reached |
  | `workspace_fork` | User creates branch from current state | Parallel state machine spawned |
  | `moment_of_truth` | Creator Moment of Truth review | Guard evaluation → advance, retreat, or adjust |

---

## Supporting Structures

- smcraft SMDF format for the creative process definition (`examples/creative-process.smdf.json`)
- smcraft runtime (TypeScript) for state machine execution
- `codevops-platform/07-workspace-lifecycle.spec.md` for workspace entity integration
- `miaco-module/04-stc-charts.spec.md` for STC chart data model
- `narrative-intelligence/02-story-beat-engine.spec.md` for narrative beats on transitions
- `llms/llms-structural-tension-charts.txt` for STC methodology
- `llms/llms-creative-orientation.txt` for creative process phases

---

## Creative Process Alignment

This spec resolves the structural tension between static lifecycle tracking and dynamic creative process execution. The resolution is natural: the creative process was ALWAYS a state machine — we simply hadn't formalized it as one. With smcraft as the engine, every workspace becomes a living state machine driven by the disequilibrium of structural tension.

---

**RISE Framework Compliance**: ✅ Creative Orientation | ✅ Structural Dynamics | ✅ Advancing Patterns | ✅ Desired Outcomes
