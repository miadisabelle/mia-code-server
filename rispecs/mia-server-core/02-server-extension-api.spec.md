# Server Extension API

> Plugin loading system enabling mia modules to register with the server.

## Desired Outcome
Third-party and built-in mia modules (miaco, three-universe, narrative-intelligence) register themselves through a unified extension API, adding routes, WebSocket handlers, and lifecycle hooks to the server without modifying core code.

## Current Reality
code-server has a monolithic route registration in `src/node/routes/` with no plugin system.

## Structural Tension
The need for modular narrative intelligence naturally drives creation of a plugin architecture.

---

## Components

### ModuleRegistry
Central registry for mia modules.
- **Behavior:** Modules call `registry.register(module)` at startup. Each module provides a `MiaModule` interface with `name`, `version`, `initialize()`, `routes()`, `wsHandlers()`, and `dispose()`. Registry validates module compatibility and prevents duplicate registration. Modules are loaded in dependency order.
- **Data:**
  ```typescript
  interface MiaModule {
    name: string;
    version: string;
    dependencies?: string[];
    initialize(context: MiaServerContext): Promise<void>;
    routes?(app: Express): void;
    wsHandlers?(router: WsRouter): void;
    dispose?(): Promise<void>;
  }
  ```

### MiaServerContext
Shared context object provided to all modules.
- **Behavior:** Contains references to the Express app, WebSocket router, configuration, logger, and inter-module communication bus. Modules use context to access shared services without tight coupling.
- **Data:**
  ```typescript
  interface MiaServerContext {
    app: Express;
    wsRouter: WsRouter;
    config: MiaConfig;
    logger: Logger;
    bus: EventEmitter;
    getModule(name: string): MiaModule | undefined;
  }
  ```

### ModuleLoader
Discovers and loads modules from configured paths.
- **Behavior:** On server startup, scans `src/node/modules/` directory and npm packages with `mia-module` keyword. Resolves dependency graph and calls `initialize()` in correct order. Failed modules are logged but don't prevent server start. Hot-reload supported in development mode.

### ModuleLifecycle
Lifecycle management for modules.
- **Behavior:** Modules receive `initialize` on server start, `dispose` on server shutdown. Health checks query each module's status. Modules can emit events on the shared bus that other modules subscribe to.

---

## Creative Advancement Scenario

**Creative Advancement Scenario**: Adding miaco Module to Server

**User Intent**: Extend mia-code-server with coDevOps capabilities
**Current Reality**: Server runs vanilla code-server without engineering tools
**Natural Progression Steps**:
  1. miaco module placed in `src/node/modules/miaco/`
  2. Server discovers module, resolves dependencies, calls `initialize()`
  3. miaco routes (`/api/miaco/schema`, `/api/miaco/validate`) become available
  4. IDE can call miaco APIs through the server
**Achieved Outcome**: Engineering tools accessible through the IDE server
**Supporting Features**: `ModuleRegistry`, `ModuleLoader`, `MiaServerContext`
