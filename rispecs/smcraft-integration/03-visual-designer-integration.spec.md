# Visual State Machine Designer Integration

> Embedding smcraft's web designer within the mia-vscode IDE for visual creative process design.

## Desired Outcome

Developers can visually design, navigate, and edit state machines — including the creative process state machine — directly within the mia-code-server IDE, through a webview panel that embeds smcraft's SVG canvas designer with full composite state drill-down (MMOT).

## Current Reality

- smcraft's web designer (Next.js, SVG canvas) exists as a standalone web app with drag-and-drop state placement, transition wiring, and validation
- The MMOT (composite state drill-down) is being built by Agent A to support hierarchical navigation
- mia-code-server has `agentic-ide/01-agent-panel.spec.md` defining a webview panel pattern
- No integration exists between the web designer and the IDE

## Structural Tension

The tension between standalone web designer and integrated IDE experience resolves toward an embedded webview that brings visual state machine design into the creative workspace.

---

## Components

### StateMachineDesignerPanel

VS Code webview panel hosting the smcraft web designer.

- **Behavior:** Activated via command palette (`Mia: Open State Machine Designer`) or activity bar icon (⚙️ gear with states). Loads smcraft's web designer in an iframe or directly rendered webview. Communicates with the mia-code-server backend via postMessage bridge for MCP tool invocations. Supports MMOT drill-down — clicking a composite state navigates into its sub-diagram with breadcrumb navigation. Panel state persisted across IDE sessions.

### WorkspaceDesignerSync

Bidirectional sync between designer and workspace lifecycle.

- **Behavior:** When a workspace has an associated state machine (via `01-state-machine-creative-process.spec.md`), the designer automatically loads it. Edits in the designer update the workspace's state machine definition. Workspace phase transitions are reflected in the designer (current state highlighted). The designer can show the creative process state machine as a visual dashboard of the workspace's progression.

### DesignerToolbar

IDE-integrated toolbar for state machine operations.

- **Behavior:** Extends the designer with IDE-specific actions: "Generate Code" (invokes smcraft codegen via MCP bridge), "Validate" (runs smcraft validation), "Export SMDF" (saves .smdf.json to workspace), "Link to STC" (associates the state machine with an STC chart). Toolbar integrates with `mia-vscode/03-activity-bar.spec.md` for consistent UI.

### GenerateButton → Backend Bridge

Connects the designer's "Generate" button to real code generation.

- **Behavior:** The "Generate" button in the web designer invokes `smcraft_generate_code` through the MCP bridge (`02-smcraft-mcp-bridge.spec.md`), which calls the real `PythonCodeGenerator` or `TypeScriptCodeGenerator` from smcraft's packages — NOT the inline lightweight reimplementation. Generated code is placed in the workspace file tree and opened in the editor.

---

## Supporting Structures

- smcraft web designer (Next.js, SVG canvas) — the embedded application
- `agentic-ide/01-agent-panel.spec.md` — webview panel pattern
- `mia-vscode/03-activity-bar.spec.md` — activity bar integration
- `02-smcraft-mcp-bridge.spec.md` — MCP tool invocations from the designer
- `01-state-machine-creative-process.spec.md` — the creative process state machine being visualized

---

**RISE Framework Compliance**: ✅ Creative Orientation | ✅ Structural Dynamics | ✅ Advancing Patterns
