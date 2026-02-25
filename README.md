# mia-code-server

**Narrative-Driven CoDevOps Development Platform**

> A Three-Universe intelligent code server — bringing engineering precision (Mia), ceremonial accountability (Ava), and narrative soul (Miette) to remote development.

## What is mia-code-server?

mia-code-server is a fork of [code-server](https://github.com/coder/code-server) transformed into a narrative-driven development platform. It runs [mia-vscode](https://github.com/miadisabelle/mia-vscode) in the browser with integrated Three-Universe intelligence, Structural Tension Charts, and agentic IDE capabilities.

### Three Universes

| Universe | Persona | Focus |
|----------|---------|-------|
| 🔧 **Engineer** | Mia | Technical precision, schema validation, code architecture |
| 🌿 **Ceremony** | Ava | Relational accountability, collaboration rituals, team health |
| 📖 **Story** | Miette | Narrative arc, creative orientation, meaning-making |

### Core Capabilities

- **Three-Universe Analysis** — Every code change analyzed through engineering, ceremonial, and narrative lenses
- **Structural Tension Charts (STC)** — Track the creative tension between current reality and desired outcomes
- **Live Story Monitor** — Real-time narrative event stream from development activity
- **PDE (Prompt Decomposition Engine)** — Break complex prompts into structured, actionable plans
- **Agentic IDE** — AI-powered agent panel, inline suggestions, and command integration
- **Narrative Memory** — Persistent story beats and session narratives across sessions
- **CoDevOps Workflows** — GitHub-integrated, narrative-aware CI/CD orchestration

## Architecture

```
mia-code-server
├── src/node/          # Server: Express.js + WebSocket + MIA modules
├── src/browser/       # Browser: service worker + pages
├── lib/vscode/        # mia-vscode fork (submodule)
├── rispecs/           # RISE specifications (62 specs)
│   ├── mia-server-core/       # Server rebranding & extension (10 specs)
│   ├── miaco-module/          # coDevOps CLI as module (8 specs)
│   ├── three-universe/        # Three-Universe processor (7 specs)
│   ├── narrative-intelligence/ # Narrative memory & analysis (7 specs)
│   ├── agentic-ide/           # IDE agentic presence (8 specs)
│   ├── mia-vscode/            # VS Code fork customization (12 specs)
│   ├── codevops-platform/     # CI/CD & workflow (6 specs)
│   └── pde-engine/            # Prompt Decomposition Engine (4 specs)
└── llms/              # LLM context documents
```

## Getting Started

```bash
# Install dependencies
npm install

# Build
npm run build

# Start
npm start
```

## Specifications

All platform specifications follow the [RISE Framework](./llms/llms-rise-framework.txt) (Reverse-engineer → Intent-extract → Specify → Export).

📋 **[Full Specification Index →](./rispecs/README.md)**

Each spec is self-contained and follows Creative Orientation principles — describing desired outcomes rather than problems to solve.

## Origins

mia-code-server integrates patterns from:

- **[miaco](https://github.com/jgwill/mia-co)** — Schema/validation/tracing CLI, STC workspace management
- **[miadi-code](https://github.com/jgwill/Miadi)** — Three-Universe terminal agent, multi-engine LLM, PDE
- **[Miadi Platform](https://github.com/miadisabelle/miadi)** — Next.js narrative hub, ceremony spiral, workflow engine

## License

MIT — See [LICENSE](./LICENSE)
