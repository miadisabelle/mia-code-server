# Terminal Integration

> Embedded miadi-code terminal agent within the IDE.

## Desired Outcome
The miadi-code interactive terminal agent runs within a VS Code integrated terminal, providing the full CLI experience (chat, slash commands, PDE, STC workspace) with awareness of the IDE context.

## Current Reality
miadi-code is a standalone CLI. It can run in VS Code's terminal but has no IDE awareness.

## Structural Tension
Terminal power users need the full CLI experience enriched with IDE context.

---

## Components

### MiaTerminalProfile
Custom terminal profile for miadi-code.
- **Behavior:** Registers a "Mia Terminal" profile in VS Code's terminal dropdown. Launches `miadi-code` with server connection automatically configured. Inherits the user's narrative session. Environment variables set for server URL, session ID, and auth token.
- **Data:**
  ```typescript
  const terminalProfile: vscode.TerminalProfile = {
    profileName: 'Mia Terminal',
    path: 'node',
    args: ['path/to/miadi-code/dist/index.js', '--server', serverUrl, '--session', sessionId],
    icon: 'mia-terminal-icon',
    color: new vscode.ThemeColor('terminal.mia.foreground'),
  };
  ```

### IDEContextInjection
Injects IDE state into terminal agent context.
- **Behavior:** Terminal agent receives current file path, selection, workspace info via environment variables or stdin pipe. When developer runs `/analyze` in terminal, it uses the IDE's active file. STC workspace commands automatically map to the IDE's open folders.

### TerminalOutputCapture
Captures terminal agent output for IDE integration.
- **Behavior:** Terminal link provider detects file paths in miadi-code output. Click opens file in editor. Error locations from validation are clickable. Chart visualizations rendered with terminal colors.

---

## Supporting Structures
- VS Code Extension API: `vscode.window.registerTerminalProfileProvider`
- Terminal link provider: `vscode.window.registerTerminalLinkProvider`
- Server connection via environment variables
