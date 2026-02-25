# Agent Panel

> VS Code webview panel for three-universe agent interaction.

## Desired Outcome
A dedicated VS Code panel provides an interactive chat interface where developers converse with three-universe agents — receiving analysis, creating charts, and managing narrative sessions directly within the IDE.

## Current Reality
miadi-code provides an interactive terminal chat. No IDE panel integration exists.

## Structural Tension
Terminal-based interaction limits the richness of narrative visualization; an IDE panel enables richer rendering.

---

## Components

### AgentWebviewPanel
VS Code webview hosting the agent interface.
- **Behavior:** Opens as a sidebar panel or editor tab. Renders a chat interface with message history. Messages show which universe(s) responded with color-coded indicators. Supports markdown rendering in responses. Input supports multiline and slash commands. Panel maintains state across tab switches.
- **Styling:** Three-universe color scheme: Engineer (blue), Ceremony (green), Story (purple). Dark/light mode following VS Code theme. Compact message layout with expandable details.
- **Layout:** Contains `ChatHistory`, `InputArea`, `UniverseSelector`, `ChartMiniView`

### ChatHistory
Scrollable message history with universe annotations.
- **Behavior:** Displays chronological messages. User messages distinguished from agent responses. Each agent message tagged with contributing universe(s). Expandable sections for detailed per-universe analysis. Code blocks with syntax highlighting. Copy-to-clipboard for code snippets.

### UniverseSelector
Toggle which universes are active in the panel.
- **Behavior:** Three toggle buttons (Engineer, Ceremony, Story). Default: all active. Toggling a universe excludes/includes it from analysis. Visual indicator of active universes. Selection persisted in session.

### ChartMiniView
Compact STC chart display within the panel.
- **Behavior:** Shows active chart's outcome, current reality, and action progress as a mini visualization. Click expands to full chart view. Progress bar showing completion percentage. Quick action buttons: add step, complete step.

### SlashCommandHandler
Processes slash commands from the input area.
- **Behavior:** Mirrors miadi-code slash commands: `/help`, `/session`, `/universe`, `/chart`, `/beat`, `/stc`, `/pde`. Commands parsed and dispatched to appropriate module APIs. Response rendered in chat history.

---

## Supporting Structures
- VS Code Extension API: `vscode.window.createWebviewPanel`
- WebSocket connection to server for real-time updates
- Message protocol between webview and extension host
