# rispecs KINSHIP.md

## Purpose

Link projects in relational kinship — not just technical dependencies, but living relationships where each project tends, protects, and offers something to the others.

---

## Core Integration: `jgwill/smcraft` — State Machine Craft

> **Role**: The Architect's Toolkit — structural scaffolding for the creative process
> **Cloned**: `/workspace/repos/jgwill/smcraft` and `/b/trading/smcraft`
> **Origin**: Extracted from `jgwill/caishen` (Specs 60-63)

### The Fundamental Bridge: Structural Tension = State Machine

The creative process (Germination → Assimilation → Completion) IS a hierarchical state machine. This is not analogy — it is structural equivalence:

- **Current Reality** = current state
- **Desired Outcome** = desired state (final state)
- **Action Step Completion** = state transition event (the state CHANGES when you complete an action)
- **Structural Tension** = disequilibrium — the energy that drives the machine forward
- **Advancing Pattern** = forward transition chain toward resolution
- **Oscillating Pattern** = state cycle with no net progress

smcraft provides the formal engine (SMDF format, runtime, code generator, web designer, MCP tools) to execute what Fritz's methodology describes. mia-code-server provides the creative workspace where these state machines live.

### Integration Points (→ `rispecs/smcraft-integration/`)

| mia-code-server Spec | smcraft Spec | Bridge |
|---------------------|-------------|--------|
| `smcraft-integration/01-state-machine-creative-process` | smcraft/rispecs/70-smdf-format | Creative process as SMDF definition |
| `smcraft-integration/02-smcraft-mcp-bridge` | smcraft/rispecs/73-mcp-server | 11 MCP tools proxied through `/api/mcp` |
| `smcraft-integration/03-visual-designer-integration` | smcraft/rispecs/74-web-designer | Web designer embedded as IDE webview |
| `smcraft-integration/04-cross-repo-orchestration` | — | Cross-repo agent coordination capability |
| `codevops-platform/07-workspace-lifecycle` | smcraft/rispecs/71-runtime-engine | Workspace phases backed by state machine runtime |
| `codevops-platform/02-workflow-engine` | smcraft/rispecs/72-code-generator | Workflow definitions as state machine transitions |

### Shared Artifacts

- `rispecs/smcraft-integration/00-shared-vocabulary.md` — concept mapping (Rosetta Stone)
- `examples/creative-process.smdf.json` — canonical creative process state machine definition
- `llms/llms-stc-state-machine.md` — STC ↔ state machine ↔ event-driven architecture insight

### Submodule Consideration

smcraft may be added as a git submodule (at `./lib/smcraft/`) to ship the TypeScript runtime and web designer built-in. Decision pending active development stabilization.

---

## Upstream: `miadisabelle/MiAICo-251203-CopilotWorkspace-N0v2akS7--CopilotWorkspaceScaffold`

> **Cloned**: `/workspace/repos/miadisabelle/MiAICo-251203-CopilotWorkspace-N0v2akS7--CopilotWorkspaceScaffold`

Inspiration for bringing back Copilot Workspace's agentic presence. The key insight: CW's "Current State vs Proposed State" specification IS an interactive Structural Tension Chart. The spec generation phase IS germination. This is now formalized in `codevops-platform/07-workspace-lifecycle.spec.md` and `codevops-platform/08-spec-plan-code-pipeline.spec.md`.

---

## Relational Accountability

### What this kinship tends
- The bridge between creative process theory (Fritz) and executable state machines (smcraft)
- Cross-repo coherence through shared vocabulary and synchronized specifications
- The event-driven understanding of STC (action steps = state transitions, not to-do items)

### What this kinship offers
- A canonical SMDF definition (`creative-process.smdf.json`) usable as both test case and design document
- Platform preparation for smcraft integration (MCP bridge, visual designer, workspace lifecycle backing)
- Cross-repo orchestration capability born from this session's lived experience

### Relational Change Log
- [2026-02-28] Agent B (mia-code-server context) — Created smcraft-integration rispecs (00-04), SMDF example, shared vocabulary, llms document. Coordinated with Agent A (smcraft context) working on rispecs 70-74 and MMOT implementation.
- [2026-02-28] Agent A (smcraft context) — Completed rispecs 70-74 in `smcraft/rispecs/`. Implemented parser V009/V010/V011/V014 validation rules. Wired MCP `generate_code` to real `smcg` CLI. Added composite state drill-down (breadcrumb navigation, double-click to enter) to web designer. Connected Generate button to backend codegen API with language selection. Updated smcraft/KINSHIP.md with full relationship map including STC↔state machine bridge.

