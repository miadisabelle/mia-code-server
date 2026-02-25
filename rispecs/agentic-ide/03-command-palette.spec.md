# Command Palette

> Mia-code commands registered in VS Code command palette.

## Desired Outcome
All mia-code-server features are accessible through the VS Code command palette with the `Mia:` prefix — enabling keyboard-driven workflows for narrative operations.

## Current Reality
No mia-specific commands exist in VS Code command palette.

## Structural Tension
Keyboard-accessible commands enable flow-state development without mouse interruption.

---

## Components

### CommandRegistry
Registers all mia commands with VS Code.
- **Behavior:** Commands prefixed with `mia.` in extension manifest. Grouped by category in palette: Analysis, Charts, Narrative, Session, Configuration. Each command has a descriptive label and optional keyboard shortcut.
- **Data:**
  ```typescript
  const commands = [
    // Analysis
    { command: 'mia.analyzeSelection', title: 'Mia: Analyze Selection (Three Universe)' },
    { command: 'mia.analyzeFile', title: 'Mia: Analyze Current File' },
    { command: 'mia.quickAnalysis', title: 'Mia: Quick Engineer Analysis' },
    
    // Charts
    { command: 'mia.createChart', title: 'Mia: Create Structural Tension Chart' },
    { command: 'mia.listCharts', title: 'Mia: List Active Charts' },
    { command: 'mia.addChartAction', title: 'Mia: Add Chart Action Step' },
    { command: 'mia.completeAction', title: 'Mia: Complete Chart Action' },
    { command: 'mia.reviewChart', title: 'Mia: Review Chart Progress' },
    
    // Narrative
    { command: 'mia.createBeat', title: 'Mia: Create Story Beat' },
    { command: 'mia.showNarrativePosition', title: 'Mia: Show Narrative Position' },
    { command: 'mia.decomposePrompt', title: 'Mia: Decompose Prompt (PDE)' },
    
    // Session
    { command: 'mia.toggleUniverse', title: 'Mia: Toggle Universe Focus' },
    { command: 'mia.openAgentPanel', title: 'Mia: Open Agent Panel' },
    { command: 'mia.showDashboard', title: 'Mia: Open STC Dashboard' },
    
    // Configuration
    { command: 'mia.selectEngine', title: 'Mia: Select LLM Engine' },
    { command: 'mia.configure', title: 'Mia: Open Configuration' },
  ];
  ```

### QuickPickIntegration
Enhanced quick pick menus for complex operations.
- **Behavior:** Chart creation uses multi-step quick pick: first enter outcome, then reality. Universe toggle shows current state with checkboxes. Engine selection shows available engines with connectivity status.

---

## Supporting Structures
- VS Code Extension API: `vscode.commands.registerCommand`
- Keyboard shortcuts configurable via `mia-vscode` keybindings
- Commands call server API through the extension's HTTP client
