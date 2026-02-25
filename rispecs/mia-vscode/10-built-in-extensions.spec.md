# Built-in Extensions

> Pre-bundled mia extensions shipped with the platform.

## Desired Outcome
mia-vscode ships with a set of built-in extensions that provide core narrative development functionality out of the box — no additional installation needed.

## Current Reality
VS Code ships with built-in extensions (git, typescript, markdown, etc.). No narrative extensions.

## Structural Tension
Zero-config narrative intelligence enables immediate value on first launch.

---

## Components

### CoreExtensionBundle
Set of extensions bundled with mia-vscode.
- **Data:**
  | Extension | ID | Purpose |
  |-----------|-----|---------|
  | Three-Universe Intelligence | `mia.three-universe` | Universe analysis, coherence scoring |
  | STC Charts | `mia.stc-charts` | Structural tension chart management |
  | Story Monitor | `mia.story-monitor` | Live narrative event dashboard |
  | Mia Theme | `mia.theme` | Three-universe color theme and icons |
  | Agent Panel | `mia.agent-panel` | Chat interface with three-universe agents |
  | Mia Terminal | `mia.terminal` | Terminal profile for miadi-code |

### ExtensionActivation
Activation events for built-in extensions.
- **Behavior:** Extensions activate on: workspace open (mia.theme, mia.stc-charts), first command invocation (mia.three-universe, mia.agent-panel), file type detection (mia.story-monitor for `.ncp.json`, `.beat.json`). Lazy activation to minimize startup impact.

---

## Supporting Structures
- Extensions built from `rispecs/agentic-ide/` and `rispecs/three-universe/` specs
- Bundled in `extensions/` directory within mia-vscode source
- Version-locked to mia-vscode release
