# Workspace Lifecycle

> The creative development workspace as a first-class entity — tracking the full journey from idea germination through to pull request completion.

## Desired Outcome
Developers work within **Workspace Sessions** that embody the creative process: each workspace tracks the structural tension between current reality and desired outcome, progressing through Germination → Assimilation → Completion phases — mirroring Fritz's creative process while enabling steerable AI at every stage.

## Current Reality
Development work is tracked through disconnected artifacts — issues, branches, commits, PRs — with no unified entity representing the creative journey from idea to integration. The PDE decomposes prompts but doesn't track lifecycle progression.

## Structural Tension
The tension between scattered development artifacts and a unified creative workspace naturally resolves toward a lifecycle entity that holds the entire story of a development act.

---

## Conceptual Bridge: Copilot Workspace ↔ RISE Framework

The retired GitHub Copilot Workspace pioneered the Task→Spec→Plan→Code→PR pipeline as the first agentic coding system. RISE reinterprets this through Creative Orientation:

| Copilot Workspace Phase | Creative Process Phase | RISE Framework Mapping |
|------------------------|----------------------|----------------------|
| Task Definition | **Germination** | Desired Outcome clarification |
| Specification (Current vs Proposed) | **Germination** | Structural Tension Chart (Current Reality ↔ Desired Outcome) |
| Plan Generation | **Assimilation** | Structural Mapping + Action Steps |
| Code Implementation | **Assimilation** | Manifestation through advancing patterns |
| Validation & PR | **Completion** | Resolution and integration |

**Key Insight**: CW's "Current State vs Proposed State" specification IS an interactive Structural Tension Chart. The spec generation phase IS the germination of structural tension.

---

## Components

### WorkspaceEntity
The first-class workspace object tracking the entire creative lifecycle.
- **Data:**
  ```typescript
  interface Workspace {
    id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
    status: 'germinating' | 'assimilating' | 'completing' | 'resolved' | 'abandoned';
    phase: WorkspacePhase;
    task: TaskDefinition;
    spec?: WorkspaceSpecification;
    plan?: ImplementationPlan;
    implementation?: CodeChanges;
    stcChartId?: string;
    narrativeArc: NarrativeArc;
    repository?: RepositoryContext;
    versionHistory: WorkspaceVersion[];
  }

  type WorkspacePhase = 'task' | 'spec' | 'plan' | 'code' | 'validate' | 'pr' | 'complete';
  ```
- **Behavior:** Created from a task description, issue reference, or PDE decomposition. Progresses through phases non-linearly — users can return to any previous phase to edit and regenerate downstream artifacts. Each phase transition recorded as a version. Status maps to Fritz's three creative process phases.

### TaskDefinition
The germination seed — what the developer wants to create.
- **Data:**
  ```typescript
  interface TaskDefinition {
    description: string;
    source: 'natural-language' | 'github-issue' | 'pde-decomposition' | 'stc-chart';
    sourceId?: string;
    creativeIntent: string;
    edits: TaskEdit[];
  }
  ```
- **Behavior:** Captures the initial creative impulse. The `creativeIntent` field explicitly names what the developer wants to bring into being (Creative Orientation, not reactive). Edits are tracked — each edit can trigger downstream regeneration. Source links to GitHub issues or PDE decompositions when applicable.

### WorkspaceSpecification
Structural tension made interactive — current reality vs desired outcome.
- **Data:**
  ```typescript
  interface WorkspaceSpecification {
    id: string;
    version: number;
    currentReality: SpecItem[];
    desiredOutcome: SpecItem[];
    generatedAt: string;
    editHistory: SpecEdit[];
  }

  interface SpecItem {
    id: string;
    text: string;
    order: number;
    addedBy: 'ai' | 'user';
    confidence?: number;
  }
  ```
- **Behavior:** AI analyzes the codebase and task to generate the structural tension — what IS (current reality) vs what WILL BE (desired outcome). Users edit both columns freely, adding, removing, or modifying items. Any edit can trigger plan regeneration. This IS the STC chart in interactive form.

### ImplementationPlan
The assimilation roadmap — concrete file-level actions.
- **Data:**
  ```typescript
  interface ImplementationPlan {
    id: string;
    version: number;
    files: PlannedFileChange[];
    generatedAt: string;
    editHistory: PlanEdit[];
  }

  interface PlannedFileChange {
    id: string;
    path: string;
    operation: 'create' | 'modify' | 'delete';
    actions: ActionItem[];
    order: number;
    dependencies: string[];
  }
  ```
- **Behavior:** Generated from the specification's structural tension. Lists every file to create, modify, or delete with specific action items. Users can add/remove files, edit actions, reorder steps. The plan is the structural mapping phase of the creative process — identifying what must change to resolve tension.

### NarrativeArc
The workspace's story — tracking it as a narrative event.
- **Data:**
  ```typescript
  interface NarrativeArc {
    creativePhase: 'germination' | 'assimilation' | 'completion';
    beats: StoryBeat[];
    tensionLevel: number;
    advancingPattern: boolean;
  }

  interface StoryBeat {
    timestamp: string;
    phase: WorkspacePhase;
    event: string;
    narrativeText: string;
  }
  ```
- **Behavior:** Each workspace IS a narrative arc. Phase transitions generate story beats. Tension level computed from distance between current reality and desired outcome. `advancingPattern` tracks whether the workspace is progressing or oscillating. This connects to `narrative-intelligence/02-story-beat-engine.spec.md`.

### PhaseTransitionEngine
Manages progression through workspace phases.
- **Behavior:** Validates phase transitions (forward or backward). Forward transitions trigger AI generation of next phase's content. Backward transitions preserve downstream content but mark it as stale. Phase transitions emit events for narrative tracking. Supports "steerable" pattern: user edits at any phase trigger selective regeneration of affected downstream phases only.

### WorkspaceVersioning
Tracks the full history of a workspace for undo/redo.
- **Behavior:** Every edit (task, spec item, plan action, code change) creates a version snapshot. Users can undo/redo across the entire workspace history. Versions include the phase at creation time. Supports workspace forking — create a new workspace from any version point.

---

## Supporting Structures
- Workspace persistence via `mia-server-core/05-session-persistence.spec.md`
- STC integration via `miaco-module/04-stc-charts.spec.md` — workspace spec IS the STC
- PDE integration via `pde-engine/01-decomposition-core.spec.md` — PDE output seeds workspaces
- Narrative tracking via `narrative-intelligence/06-session-narrative.spec.md`
- API exposure via `mia-server-core/11-workspace-api.spec.md`
- Three-universe analysis at each phase via `three-universe/01-universe-processor.spec.md`

---

## Creative Process Alignment

### Germination Phase (Task + Spec)
- Initial excitement and vision development
- Structural tension established between current reality and desired outcome
- Risk: Getting addicted to planning without acting (mitigated by steerable progression)
- PDE decomposition can seed the germination

### Assimilation Phase (Plan + Code)
- Internalizing structural tension until implementation flows naturally
- The "universe cooperates" — AI assists with implementation
- Most substantial phase where real creative work happens
- Risk: Impatience with incremental progress

### Completion Phase (Validate + PR)
- Bringing creation to successful conclusion
- More complex actions required (testing, review, integration)
- Risk: Abandoning before full completion
- Practice: Each workspace completion builds creative mastery
