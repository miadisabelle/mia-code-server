# Configuration System

> Unified configuration for server and narrative modules.

## Desired Outcome
A single configuration system manages both code-server settings and mia-code-server narrative module settings, with file-based config, environment variables, and CLI flags all respected in correct precedence.

## Current Reality
code-server uses `src/node/cli.ts` for CLI parsing and `src/node/settings.ts` for YAML-based settings.

## Structural Tension
Narrative modules need configuration alongside server settings without fragmenting the config experience.

---

## Components

### MiaConfig
Extended configuration schema.
- **Behavior:** Extends code-server's existing config with `narrative` section. Config file at `~/.config/mia-code-server/config.yaml`. Environment variables prefixed with `MIA_`. CLI flags for common narrative options.
- **Data:**
  ```yaml
  # ~/.config/mia-code-server/config.yaml
  bind-addr: 0.0.0.0:8080
  auth: password
  password: ...
  cert: false
  
  narrative:
    enabled: true
    default-universe: all
    auto-analysis: false
    trace:
      enabled: false
      langfuse-url: https://cloud.langfuse.com
    engines:
      default: claude
      claude:
        model: sonnet
      gemini:
        model: gemini-pro
      ollama:
        host: http://localhost:11434
        model: llama3
    modules:
      miaco: true
      three-universe: true
      pde: true
    storage:
      type: file  # or 'redis'
      redis-url: redis://localhost:6379
  ```

### ConfigValidation
Schema validation for configuration.
- **Behavior:** On startup, config is validated against a JSON schema. Invalid values produce clear error messages. Missing optional values use sensible defaults. Environment variables override file config. CLI flags override both.

---

## Supporting Structures
- Extends `src/node/cli.ts` argument parsing
- Extends `src/node/settings.ts` YAML loader
- Config schema exported for documentation generation
