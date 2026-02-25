# Decomposition Core

> PDE (Prompt Decomposition Engine) core analysis system.

## Desired Outcome
A prompt decomposition engine that breaks complex natural language prompts into structured, actionable components — extracting explicit intents, implicit desires, dependencies, and mapping them to the Four Directions.

## Current Reality
PDE exists as an MCP tool (`mcp-pde`). No integrated version for the platform.

## Structural Tension
Integrated decomposition transforms vague requests into precise action plans.

---

## Components

### DecompositionProcessor
Core decomposition analysis engine.
- **Behavior:** Accepts natural language prompt. Produces `DecompositionResult`:
  ```typescript
  interface DecompositionResult {
    id: string;
    timestamp: string;
    original_prompt: string;
    primary_intents: Intent[];
    secondary_intents: Intent[];
    implicit_intents: Intent[];
    action_stack: Action[];
    ambiguities: Ambiguity[];
    four_directions: FourDirections;
    dependencies: Dependency[];
  }
  ```
  Uses LLM to analyze prompt with structured extraction prompts. Identifies hedging language for implicit intents. Maps actions to dependency graph. Assigns confidence scores. Results stored in `.pde/` directory.

### IntentExtractor
Extracts layered intents from natural language.
- **Behavior:** Three-layer extraction: 1) **Primary** — explicitly stated goals; 2) **Secondary** — implied requirements for primary goals; 3) **Implicit** — unstated but desired outcomes (detected from hedging, qualifiers, assumptions). Each intent includes: description, confidence (0-1), keywords, estimated complexity.

### DependencyMapper
Maps dependencies between extracted actions.
- **Behavior:** Analyzes action stack for logical dependencies. Creates DAG (Directed Acyclic Graph) of actions. Identifies parallel execution opportunities. Detects circular dependencies (error). Generates execution order recommendations.

---

## Supporting Structures
- LLM interaction via multi-engine adapter (see `three-universe/07-multi-engine-adapter.spec.md`)
- Results stored as JSON in `.pde/` directory
- Export to markdown via `pde_export_markdown`
