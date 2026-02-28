# RISE Specifications — mia-code-server

> Narrative-Driven CoDevOps Development Platform

**Version**: 0.1.0  
**Framework**: RISE v1.2 (Reverse-engineer → Intent-extract → Specify → Export)  
**Composed by**: Copilot, 2026-02-25  
**Source Analysis**: jgwill/Miadi, jgwill/mia-co, coder/code-server

---

## Vision

**mia-code-server** transforms the remote VS Code IDE into an **Intelligent CoDevOps Platform** where development is enriched through Three-Universe narrative intelligence. Every coding session becomes a creative act processed through Engineering precision (Mia), Story coherence (Miette), and Ceremonial accountability (Ava).

### Desired Outcome
Developers access a remote IDE that understands their creative intent, tracks structural tension in their projects, provides agentic assistance through three interpretive lenses, and orchestrates development workflows as narrative events.

### Current Reality
code-server provides remote VS Code access. The miaco CLI and miadi-code agent exist as standalone tools. The Miadi platform offers narrative web services but doesn't deliver reliably. These systems are disconnected.

### Structural Tension
The tension between isolated tools and unified creative development platform drives natural convergence into mia-code-server.

---

## Specification Index

### 🖥️ [mia-server-core/](./mia-server-core/) — Server Foundation (11 specs)
Core server rebranding and extension points for the mia-code-server platform.

| # | Spec | Description |
|---|------|-------------|
| 01 | [server-rebranding.spec.md](./mia-server-core/01-server-rebranding.spec.md) | Package identity, CLI entry, naming conventions |
| 02 | [server-extension-api.spec.md](./mia-server-core/02-server-extension-api.spec.md) | Plugin/extension loading for mia modules |
| 03 | [narrative-routes.spec.md](./mia-server-core/03-narrative-routes.spec.md) | HTTP routes for narrative intelligence APIs |
| 04 | [websocket-narrative-channel.spec.md](./mia-server-core/04-websocket-narrative-channel.spec.md) | Real-time narrative event streaming |
| 05 | [session-persistence.spec.md](./mia-server-core/05-session-persistence.spec.md) | IDE session state with narrative context |
| 06 | [authentication-extension.spec.md](./mia-server-core/06-authentication-extension.spec.md) | Auth extended for multi-universe identity |
| 07 | [configuration-system.spec.md](./mia-server-core/07-configuration-system.spec.md) | Unified config for server + narrative modules |
| 08 | [health-telemetry.spec.md](./mia-server-core/08-health-telemetry.spec.md) | Health checks and narrative telemetry |
| 09 | [mcp-server-integration.spec.md](./mia-server-core/09-mcp-server-integration.spec.md) | Model Context Protocol server embedding |
| 10 | [proxy-narrative-middleware.spec.md](./mia-server-core/10-proxy-narrative-middleware.spec.md) | Proxy middleware with narrative context injection |
| 11 | [workspace-api.spec.md](./mia-server-core/11-workspace-api.spec.md) | **Workspace lifecycle HTTP API endpoints** |

### 🔧 [miaco-module/](./miaco-module/) — CoDevOps CLI Module (8 specs)
The miaco engineering CLI modularized for server-side integration.

| # | Spec | Description |
|---|------|-------------|
| 01 | [schema-operations.spec.md](./miaco-module/01-schema-operations.spec.md) | Schema design, listing, export, migration |
| 02 | [validation-engine.spec.md](./miaco-module/02-validation-engine.spec.md) | NCP, beat, coherence, and type validation |
| 03 | [tracing-system.spec.md](./miaco-module/03-tracing-system.spec.md) | Session tracing with Langfuse integration |
| 04 | [stc-charts.spec.md](./miaco-module/04-stc-charts.spec.md) | Structural Tension Chart management |
| 05 | [cli-adapter.spec.md](./miaco-module/05-cli-adapter.spec.md) | CLI-to-module adapter pattern |
| 06 | [cross-system-correlation.spec.md](./miaco-module/06-cross-system-correlation.spec.md) | Trace correlation headers across systems |
| 07 | [workspace-sync.spec.md](./miaco-module/07-workspace-sync.spec.md) | STC workspace file synchronization |
| 08 | [module-api.spec.md](./miaco-module/08-module-api.spec.md) | Programmatic API for server integration |

### 🌌 [three-universe/](./three-universe/) — Three-Universe Processor (7 specs)
Core system processing all interactions through Engineer, Ceremony, and Story lenses.

| # | Spec | Description |
|---|------|-------------|
| 01 | [universe-processor.spec.md](./three-universe/01-universe-processor.spec.md) | Core processor dispatching to three lenses |
| 02 | [engineer-lens.spec.md](./three-universe/02-engineer-lens.spec.md) | Mia: Technical precision analysis |
| 03 | [ceremony-lens.spec.md](./three-universe/03-ceremony-lens.spec.md) | Ava: Relational accountability analysis |
| 04 | [story-lens.spec.md](./three-universe/04-story-lens.spec.md) | Miette: Narrative coherence analysis |
| 05 | [coherence-scoring.spec.md](./three-universe/05-coherence-scoring.spec.md) | Three-universe voting and synthesis |
| 06 | [universe-context.spec.md](./three-universe/06-universe-context.spec.md) | Context management across universes |
| 07 | [multi-engine-adapter.spec.md](./three-universe/07-multi-engine-adapter.spec.md) | Claude/Gemini/Ollama engine abstraction |

### 🤖 [agentic-ide/](./agentic-ide/) — Agentic IDE Presence (8 specs)
Interactive agentic presence within the VS Code IDE environment.

| # | Spec | Description |
|---|------|-------------|
| 01 | [agent-panel.spec.md](./agentic-ide/01-agent-panel.spec.md) | VS Code webview panel for agent interaction |
| 02 | [inline-suggestions.spec.md](./agentic-ide/02-inline-suggestions.spec.md) | Three-universe inline code suggestions |
| 03 | [command-palette.spec.md](./agentic-ide/03-command-palette.spec.md) | Mia-code commands in VS Code palette |
| 04 | [status-bar.spec.md](./agentic-ide/04-status-bar.spec.md) | Universe status and STC progress bar |
| 05 | [file-decorations.spec.md](./agentic-ide/05-file-decorations.spec.md) | File-level narrative annotations |
| 06 | [terminal-integration.spec.md](./agentic-ide/06-terminal-integration.spec.md) | Embedded miadi-code terminal agent |
| 07 | [chat-participant.spec.md](./agentic-ide/07-chat-participant.spec.md) | VS Code Chat API participant |
| 08 | [diagnostic-provider.spec.md](./agentic-ide/08-diagnostic-provider.spec.md) | Three-universe diagnostic messages |

### 🧠 [narrative-intelligence/](./narrative-intelligence/) — Narrative Memory & Analysis (7 specs)
Memory systems and narrative analysis engines.

| # | Spec | Description |
|---|------|-------------|
| 01 | [narrative-memory.spec.md](./narrative-intelligence/01-narrative-memory.spec.md) | Spiral memory architecture with Redis |
| 02 | [story-beat-engine.spec.md](./narrative-intelligence/02-story-beat-engine.spec.md) | Automatic story beat generation |
| 03 | [lattice-weaver.spec.md](./narrative-intelligence/03-lattice-weaver.spec.md) | Pattern recognition across connections |
| 04 | [coaia-narrative-adapter.spec.md](./narrative-intelligence/04-coaia-narrative-adapter.spec.md) | coaia-narrative MCP integration |
| 05 | [live-story-monitor.spec.md](./narrative-intelligence/05-live-story-monitor.spec.md) | Real-time narrative event dashboard |
| 06 | [session-narrative.spec.md](./narrative-intelligence/06-session-narrative.spec.md) | IDE session as narrative arc |
| 07 | [narrative-search.spec.md](./narrative-intelligence/07-narrative-search.spec.md) | Semantic search across narrative memory |

### 🖼️ [mia-vscode/](./mia-vscode/) — VS Code Customization (12 specs)
Customization layer for the mia-vscode fork.

| # | Spec | Description |
|---|------|-------------|
| 01 | [branding-theme.spec.md](./mia-vscode/01-branding-theme.spec.md) | Mia visual identity and theming |
| 02 | [welcome-experience.spec.md](./mia-vscode/02-welcome-experience.spec.md) | First-run and welcome page customization |
| 03 | [activity-bar.spec.md](./mia-vscode/03-activity-bar.spec.md) | Custom activity bar with universe icons |
| 04 | [sidebar-views.spec.md](./mia-vscode/04-sidebar-views.spec.md) | Three-universe sidebar panels |
| 05 | [editor-overlays.spec.md](./mia-vscode/05-editor-overlays.spec.md) | Narrative overlay on editor content |
| 06 | [settings-schema.spec.md](./mia-vscode/06-settings-schema.spec.md) | Mia-specific settings contributions |
| 07 | [keybindings.spec.md](./mia-vscode/07-keybindings.spec.md) | Default keybindings for mia commands |
| 08 | [product-json.spec.md](./mia-vscode/08-product-json.spec.md) | product.json customization for mia-vscode |
| 09 | [extension-marketplace.spec.md](./mia-vscode/09-extension-marketplace.spec.md) | Custom extension gallery/registry |
| 10 | [built-in-extensions.spec.md](./mia-vscode/10-built-in-extensions.spec.md) | Pre-bundled mia extensions |
| 11 | [telemetry-narrative.spec.md](./mia-vscode/11-telemetry-narrative.spec.md) | Telemetry routed through narrative system |
| 12 | [output-channels.spec.md](./mia-vscode/12-output-channels.spec.md) | Universe-specific output channels |

### ⚙️ [codevops-platform/](./codevops-platform/) — CI/CD & Workflows (8 specs)
Development workflow orchestration, workspace lifecycle, and automation.

| # | Spec | Description |
|---|------|-------------|
| 01 | [webhook-processor.spec.md](./codevops-platform/01-webhook-processor.spec.md) | GitHub webhook ETL as narrative events |
| 02 | [workflow-engine.spec.md](./codevops-platform/02-workflow-engine.spec.md) | Workflow orchestration with narrative beats |
| 03 | [ceremony-spiral.spec.md](./codevops-platform/03-ceremony-spiral.spec.md) | Ceremony spiral for development workflows |
| 04 | [github-integration.spec.md](./codevops-platform/04-github-integration.spec.md) | GitHub API integration for CoDevOps |
| 05 | [agent-communication.spec.md](./codevops-platform/05-agent-communication.spec.md) | Agent-to-agent messaging system |
| 06 | [deployment-pipeline.spec.md](./codevops-platform/06-deployment-pipeline.spec.md) | Build/deploy pipeline with narrative tracking |
| 07 | [workspace-lifecycle.spec.md](./codevops-platform/07-workspace-lifecycle.spec.md) | **Workspace as creative lifecycle entity (Germination→Assimilation→Completion)** |
| 08 | [spec-plan-code-pipeline.spec.md](./codevops-platform/08-spec-plan-code-pipeline.spec.md) | **AI-guided Spec→Plan→Code pipeline with steerability** |

### 🔍 [pde-engine/](./pde-engine/) — Prompt Decomposition Engine (5 specs)
Five-layer prompt analysis, decomposition, and steerable germination system.

| # | Spec | Description |
|---|------|-------------|
| 01 | [decomposition-core.spec.md](./pde-engine/01-decomposition-core.spec.md) | Core 5-layer decomposition algorithm |
| 02 | [medicine-wheel-mapping.spec.md](./pde-engine/02-medicine-wheel-mapping.spec.md) | Four Directions intent mapping |
| 03 | [workflow-generation.spec.md](./pde-engine/03-workflow-generation.spec.md) | Automatic workflow template generation |
| 04 | [pde-mcp-server.spec.md](./pde-engine/04-pde-mcp-server.spec.md) | PDE as MCP tool server |
| 05 | [steerable-decomposition.spec.md](./pde-engine/05-steerable-decomposition.spec.md) | **Interactive germination — steerable decomposition with editing & regeneration** |

### 🔗 [smcraft-integration/](./smcraft-integration/) — State Machine Integration (5 specs)
smcraft (State Machine Craft) integration — creative process as executable state machine.

| # | Spec | Description |
|---|------|-------------|
| 00 | [shared-vocabulary.md](./smcraft-integration/00-shared-vocabulary.md) | Concept mapping between smcraft and mia-code-server |
| 01 | [state-machine-creative-process.spec.md](./smcraft-integration/01-state-machine-creative-process.spec.md) | **STC as state machine — Germination→Assimilation→Completion as SMDF** |
| 02 | [smcraft-mcp-bridge.spec.md](./smcraft-integration/02-smcraft-mcp-bridge.spec.md) | Proxying smcraft's 11 MCP tools through /api/mcp |
| 03 | [visual-designer-integration.spec.md](./smcraft-integration/03-visual-designer-integration.spec.md) | Embedding smcraft web designer as VS Code webview |
| 04 | [cross-repo-orchestration.spec.md](./smcraft-integration/04-cross-repo-orchestration.spec.md) | **Agentic cross-repo coordination as platform capability** |

---

## Total: 71 Specifications

## Cross-Cutting Concerns

All specs follow:
- **RISE Framework** v1.2 — Creative Orientation, Structural Tension, Advancing Patterns
- **SpecLang Syntax** — Behavior/Styling/Layout sections, backtick cross-references
- **Codebase Agnosticism** — Each spec is implementable without access to source repos
- **Three-Universe Lens** — Every component considered through Engineer/Ceremony/Story perspectives

## Related Repositories
- `miadisabelle/mia-code-server` — This platform (code-server fork)
- `miadisabelle/mia-vscode` — VS Code fork for IDE customization
- `jgwill/Miadi` — Source of miadi-code patterns and Miadi platform
- `jgwill/mia-co` — Source of miaco CLI patterns

---
**RISE Framework Compliance**: ✅ Creative Orientation | ✅ Structural Dynamics | ✅ Advancing Patterns | ✅ Desired Outcomes
