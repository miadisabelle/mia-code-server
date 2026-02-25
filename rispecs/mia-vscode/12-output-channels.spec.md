# Output Channels

> Universe-specific output channels for debugging and logging.

## Desired Outcome
Each universe has its own VS Code Output Channel, providing dedicated logging streams for engineering diagnostics, ceremonial reflections, and story narration.

## Current Reality
VS Code supports multiple output channels. No narrative-specific channels exist.

## Structural Tension
Dedicated channels prevent narrative output from cluttering standard development logs.

---

## Components

### UniverseOutputChannels
Three dedicated output channels.
- **Behavior:** Creates output channels: "Mia: Engineer 🔧", "Mia: Ceremony 🌿", "Mia: Story 📖". Each channel receives output from its respective universe analysis. Verbose mode logs all universe processing. Standard mode logs significant results only. Channels accessible from Output panel dropdown.

### NarrativeLogChannel
Combined narrative log channel.
- **Behavior:** Creates "Mia: Narrative" output channel showing all narrative events chronologically. Each entry prefixed with universe emoji. Includes beats, chart updates, analysis summaries. Useful for debugging narrative flow.

### ServerLogChannel
Server-side log channel.
- **Behavior:** Creates "Mia: Server" output channel showing mia-code-server logs. Module loading, route registration, WebSocket events. Filtered from standard code-server logs.

---

## Supporting Structures
- VS Code Extension API: `vscode.window.createOutputChannel`
- Log level configurable (debug, info, warn, error)
- Channels lazy-created on first write
