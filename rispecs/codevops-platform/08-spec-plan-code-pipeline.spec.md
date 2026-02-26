# Spec→Plan→Code Pipeline

> AI-guided pipeline transforming structural tension specifications into implementation plans and executable code changes.

## Desired Outcome
A pipeline engine that takes a workspace's structural tension (current reality vs desired outcome) and progressively generates implementation plans and code changes — with the developer steering AI output at every stage, following the creative process from assimilation through completion.

## Current Reality
The workflow engine (`codevops-platform/02-workflow-engine.spec.md`) orchestrates generic steps. PDE decomposes prompts. Neither provides the structured Spec→Plan→Code progression with steerable AI generation that Copilot Workspace pioneered.

## Structural Tension
The gap between having structural tension clarity (via STC/specs) and having executable code changes naturally resolves toward an AI-guided pipeline that translates tension into action.

---

## Components

### SpecAnalyzer
Analyzes workspace specification to prepare for plan generation.
- **Behavior:** Reads workspace's `currentReality` and `desiredOutcome` arrays. Identifies the delta — what needs to change. Performs codebase analysis to find relevant files. Builds context window with: repository structure, relevant file contents, spec items, and coding patterns detected. Outputs a `PlanningContext` ready for AI generation.
- **Data:**
  ```typescript
  interface PlanningContext {
    specId: string;
    delta: SpecDelta[];
    relevantFiles: FileContext[];
    repositoryStructure: string;
    patterns: CodePattern[];
    maxTokenBudget: number;
  }

  interface SpecDelta {
    desiredOutcome: string;
    relatedCurrentReality: string[];
    gapAnalysis: string;
    estimatedComplexity: 'low' | 'medium' | 'high';
  }
  ```

### PlanGenerator
AI-guided generation of implementation plans from specifications.
- **Behavior:** Takes `PlanningContext` and generates an `ImplementationPlan`. Uses structured prompts following RISE's SpecLang approach — the prompt IS specification prose, not reactive instructions. Generates file-level change descriptions with action items. Supports streaming output for real-time display. Plans respect dependency ordering between files.
- **Prompt Strategy:**
  ```
  Given this structural tension:
  Current Reality: {currentReality items}
  Desired Outcome: {desiredOutcome items}
  
  And this codebase context:
  {repository structure + relevant files}
  
  Generate a plan that resolves this structural tension through
  advancing patterns — each file change should build upon previous
  changes, creating natural progression toward the desired outcome.
  ```

### CodeGenerator
Generates code changes from implementation plan.
- **Behavior:** Takes `ImplementationPlan` and generates file-by-file code changes. Each file processed independently with full context. Output is unified diff format per file. Respects existing code style and patterns. Supports per-file regeneration — user edits plan, regenerates only affected files. Code generation is the heart of the assimilation phase.
- **Data:**
  ```typescript
  interface CodeChange {
    fileId: string;
    filePath: string;
    operation: 'create' | 'modify' | 'delete';
    diff: string;
    newContent: string;
    oldContent?: string;
    status: 'generating' | 'generated' | 'user-edited' | 'accepted';
  }
  ```

### PipelineOrchestrator
Coordinates the Spec→Plan→Code flow with steerability.
- **Behavior:** Manages the full pipeline: spec analysis → plan generation → code generation. At each stage, pauses for user review/editing before proceeding. Supports selective regeneration: edit spec → regenerate plan → regenerate affected code only. Tracks which downstream artifacts are stale after upstream edits. Emits narrative beats for each pipeline stage (connects to workflow engine).
- **Data:**
  ```typescript
  interface PipelineState {
    workspaceId: string;
    currentStage: 'analyzing' | 'planning' | 'coding' | 'paused' | 'complete';
    planningContext?: PlanningContext;
    plan?: ImplementationPlan;
    codeChanges: CodeChange[];
    staleArtifacts: string[];
  }
  ```

### SteerabilityManager
Handles user interventions in the pipeline.
- **Behavior:** User can: edit spec items → marks plan as stale; edit plan actions → marks affected code as stale; edit generated code → marks as user-edited (preserved on regeneration); add new files to plan → triggers code generation for new files only; remove files from plan → removes corresponding code changes. All interventions logged as narrative beats. Supports "regenerate from here" at any stage.

---

## Integration Points

### With Workflow Engine
Pipeline stages map to workflow steps (see `codevops-platform/02-workflow-engine.spec.md`):
```yaml
name: spec-plan-code-pipeline
narrative: "Structural tension resolves through progressive implementation"
steps:
  - id: analyze-spec
    action: spec-analyze
    universe: engineer
    beat: "Engineering lens examines structural tension"
  - id: generate-plan
    action: plan-generate
    universe: engineer
    beat: "Implementation roadmap crystallizes from tension"
  - id: generate-code
    action: code-generate
    universe: engineer
    beat: "Code manifests from plan through advancing patterns"
  - id: validate
    action: run-tests
    universe: engineer
    beat: "Validation confirms structural tension resolution"
```

### With Three-Universe Analysis
Each pipeline stage can be analyzed through three lenses:
- **Engineer (Mia)**: Technical correctness, code quality, test coverage
- **Ceremony (Ava)**: Collaboration patterns, review readiness, accountability
- **Story (Miette)**: Narrative coherence, creative advancement, completion trajectory

---

## Supporting Structures
- Orchestrated by workspace lifecycle (`codevops-platform/07-workspace-lifecycle.spec.md`)
- Code generation uses multi-engine adapter (`three-universe/07-multi-engine-adapter.spec.md`)
- Plans compatible with workflow engine format (`codevops-platform/02-workflow-engine.spec.md`)
- Pipeline events feed story beat engine (`narrative-intelligence/02-story-beat-engine.spec.md`)
- Validation integrates with deployment pipeline (`codevops-platform/06-deployment-pipeline.spec.md`)
