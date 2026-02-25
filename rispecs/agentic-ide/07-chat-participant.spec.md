# Chat Participant

> VS Code Chat API participant for three-universe interaction.

## Desired Outcome
Mia registers as a VS Code Chat participant, enabling developers to invoke three-universe analysis through the native chat experience with `@mia` mentions — integrating with VS Code's built-in AI chat UX.

## Current Reality
VS Code has a Chat API for extensions to register chat participants. No mia participant exists.

## Structural Tension
Native chat integration provides the most natural interaction pattern for IDE-based AI assistance.

---

## Components

### MiaChatParticipant
VS Code Chat API participant registration.
- **Behavior:** Registers `@mia` as a chat participant. Handles mentions with three-universe processing. Supports followup questions within the chat thread. Renders universe-annotated responses with markdown. Supports slash subcommands within chat: `@mia /engineer`, `@mia /chart`, `@mia /pde`.
- **Data:**
  ```typescript
  const participant: vscode.ChatParticipant = {
    id: 'mia.chat',
    name: 'Mia',
    fullName: 'Mia — Three-Universe Intelligence',
    iconPath: 'resources/mia-icon.svg',
    description: 'Analyze through Engineer, Ceremony, and Story lenses',
  };
  ```

### ChatCommandHandlers
Slash commands within the chat participant.
- **Behavior:**
  - `@mia /engineer <text>` — Engineer-only analysis
  - `@mia /ceremony <text>` — Ceremony-only analysis
  - `@mia /story <text>` — Story-only analysis
  - `@mia /chart create <outcome>` — Create STC chart
  - `@mia /pde <prompt>` — Decompose prompt
  - `@mia /beat <description>` — Create story beat
  - Default (no subcommand): Full three-universe analysis

### ChatResponseRenderer
Renders three-universe responses in chat format.
- **Behavior:** Uses VS Code chat markdown rendering. Universe sections as collapsible details. Coherence score as progress bar. Code suggestions as code blocks with apply buttons. Chart progress as inline visualization.

---

## Supporting Structures
- VS Code Extension API: `vscode.chat.createChatParticipant`
- Chat responses streamed via `ChatResponseStream`
- Thread history maintained for context continuity
