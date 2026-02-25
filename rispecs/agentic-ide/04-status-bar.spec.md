# Status Bar

> Universe status and STC progress display in VS Code status bar.

## Desired Outcome
The VS Code status bar shows at-a-glance information about active universes, current STC chart progress, narrative phase, and LLM engine status — providing ambient awareness without interrupting workflow.

## Current Reality
code-server's VS Code has standard status bar items. No narrative awareness.

## Structural Tension
Ambient information reduces the cognitive cost of maintaining narrative awareness during development.

---

## Components

### UniverseStatusItem
Shows active universe configuration.
- **Behavior:** Displays icons for active universes: 🔧 (Engineer), 🌿 (Ceremony), 📖 (Story). Grayed icons for inactive universes. Click toggles universe activation. Tooltip shows universe names and current coherence score.
- **Layout:** Left-aligned status bar item, priority 100

### ChartProgressItem
Shows active STC chart completion.
- **Behavior:** Displays `STC: 3/7 ✓` showing completed/total actions. Click opens chart review panel. Color changes: green (>75%), yellow (25-75%), red (<25%). Hidden when no active charts.
- **Layout:** Left-aligned status bar item, priority 99

### NarrativePhaseItem
Shows current project narrative phase.
- **Behavior:** Displays phase emoji and name: 🌱 Germination, 🔨 Assimilation, ✨ Completion. Click shows phase details and recommended actions. Updates based on `NarrativePhaseDetector` analysis.
- **Layout:** Right-aligned status bar item, priority 50

### EngineStatusItem
Shows current LLM engine status.
- **Behavior:** Displays engine icon and name (e.g., `⚡ Claude`). Green dot when connected, red when unavailable. Click opens engine selection quick pick. Tooltip shows model name and request count for session.
- **Layout:** Right-aligned status bar item, priority 49

---

## Supporting Structures
- VS Code Extension API: `vscode.window.createStatusBarItem`
- Items update via WebSocket events from server
- Configurable visibility per-item in settings
