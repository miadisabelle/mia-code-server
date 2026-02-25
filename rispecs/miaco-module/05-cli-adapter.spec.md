# CLI Adapter

> Adapter pattern converting miaco CLI commands into server module calls.

## Desired Outcome
The miaco CLI command structure (`miaco schema design`, `miaco validate ncp`, etc.) is preserved as both a standalone CLI and as programmatic module calls within mia-code-server — enabling the same operations from terminal, IDE command palette, and HTTP API.

## Current Reality
miaco is a standalone CLI tool using Commander.js.

## Structural Tension
The valuable CLI ergonomics need to work across multiple interfaces without code duplication.

---

## Components

### CommandAdapter
Maps CLI commands to module function calls.
- **Behavior:** Each CLI command (e.g., `miaco schema design --name X --type Y`) maps to a module function call (e.g., `schemaOperations.design({ name: 'X', type: 'Y' })`). Commander.js definitions serve as the canonical interface. Adapter generates both CLI parser and TypeScript API types from the same command definitions.
- **Data:**
  ```typescript
  interface CommandDefinition {
    name: string;
    description: string;
    subcommands?: CommandDefinition[];
    options: CommandOption[];
    handler: (args: Record<string, unknown>) => Promise<CommandResult>;
  }
  interface CommandResult {
    success: boolean;
    data?: unknown;
    message?: string;
    errors?: string[];
  }
  ```

### CLIRunner
Standalone CLI mode for miaco operations.
- **Behavior:** When invoked as `mia-code-server miaco <command>`, runs the command directly without starting the full server. Uses the same module code as the server. Output formatted for terminal (tables, colors via chalk).

### RESTAdapter
Maps module functions to REST API endpoints.
- **Behavior:** Each command function automatically exposed as a REST endpoint. `schema.design(args)` → `POST /api/miaco/schema/design`. `schema.list(args)` → `GET /api/miaco/schema`. Input validation uses the same option definitions. Response wraps `CommandResult` in standard API envelope.

---

## Supporting Structures
- Single source of truth: command definitions generate CLI, API, and TypeScript types
- CLI uses `commander` package; API uses Express routes
- Format adapters for terminal (chalk tables), JSON, and YAML output
