# Workflow Engine

> Orchestrates multi-step development workflows as narrative arcs.

## Desired Outcome
A workflow engine that coordinates complex development operations (build, test, deploy, review) as narrative arcs — each step a beat in the development story.

## Current Reality
Development workflows are managed externally (CI/CD). No narrative-aware orchestration.

## Structural Tension
Workflow-as-narrative creates meaning from mechanical process steps.

---

## Components

### WorkflowDefinition
Declarative workflow specification format.
- **Data:**
  ```yaml
  name: feature-delivery
  narrative: "A new capability journeys from idea to production"
  steps:
    - id: validate
      action: schema-validate
      universe: engineer
      beat: "Validation confirms structural integrity"
    - id: test
      action: run-tests
      universe: engineer
      depends_on: [validate]
      beat: "Tests verify the promise holds"
    - id: review
      action: request-review
      universe: ceremony
      depends_on: [test]
      beat: "Peers gather to witness the work"
    - id: integrate
      action: merge-pr
      universe: story
      depends_on: [review]
      beat: "The feature joins the living codebase"
  ```

### WorkflowExecutor
Executes workflow steps and tracks progress.
- **Behavior:** Loads workflow definitions from YAML files. Resolves dependency graph. Executes steps in dependency order. Parallel execution for independent steps. Each step generates a story beat. Failure triggers narrative event (tension point). Resume capability after failure resolution. Progress visible in STC Dashboard.

### WorkflowTemplates
Pre-built workflow templates for common patterns.
- **Behavior:** Includes templates: `feature-delivery`, `hotfix-resolution`, `refactoring-journey`, `dependency-update`, `release-ceremony`. Templates customizable per workspace. Custom templates storable in `.mia/workflows/`.

---

## Supporting Structures
- YAML workflow definitions in `.mia/workflows/`
- Execution state persisted for resume capability
- WebSocket events for real-time progress
