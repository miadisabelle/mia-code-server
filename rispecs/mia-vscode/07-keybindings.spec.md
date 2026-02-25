# Keybindings

> Default keybindings for mia commands.

## Desired Outcome
Common mia operations have intuitive keyboard shortcuts that don't conflict with standard VS Code bindings — enabling rapid narrative-driven development.

## Current Reality
No mia keybindings exist. VS Code has a keybinding contribution system.

## Structural Tension
Keyboard shortcuts reduce friction between intention and action.

---

## Components

### DefaultKeybindings
Keyboard shortcuts for core mia operations.
- **Data:**
  ```json
  {
    "contributes": {
      "keybindings": [
        { "command": "mia.analyzeSelection", "key": "ctrl+shift+m a", "when": "editorTextFocus" },
        { "command": "mia.openAgentPanel", "key": "ctrl+shift+m p", "when": "" },
        { "command": "mia.createChart", "key": "ctrl+shift+m c", "when": "" },
        { "command": "mia.createBeat", "key": "ctrl+shift+m b", "when": "" },
        { "command": "mia.toggleUniverse", "key": "ctrl+shift+m u", "when": "" },
        { "command": "mia.showDashboard", "key": "ctrl+shift+m d", "when": "" },
        { "command": "mia.decomposePrompt", "key": "ctrl+shift+m e", "when": "" },
        { "command": "mia.quickAnalysis", "key": "ctrl+shift+m q", "when": "editorTextFocus" }
      ]
    }
  }
  ```
- **Behavior:** All mia bindings use `ctrl+shift+m` (Mia) as chord prefix. Second key is mnemonic: a=analyze, p=panel, c=chart, b=beat, u=universe, d=dashboard, e=decompose (PDE), q=quick. Bindings customizable through standard VS Code keybinding settings.

---

## Supporting Structures
- Chord prefix `ctrl+shift+m` avoids conflicts with standard bindings
- Keybindings listed in welcome page and command palette descriptions
- Platform-specific alternatives (cmd on macOS) handled by VS Code
