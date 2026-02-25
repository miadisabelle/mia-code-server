# Settings Schema

> Mia-specific settings contributions for VS Code preferences.

## Desired Outcome
All mia-code-server features are configurable through VS Code's standard settings UI, with well-documented options organized in a "Mia" settings category.

## Current Reality
VS Code has a settings contribution system. No mia settings registered.

## Structural Tension
Standard settings integration makes configuration discoverable and familiar.

---

## Components

### SettingsContribution
VS Code extension settings in package.json.
- **Data:**
  ```json
  {
    "contributes": {
      "configuration": {
        "title": "Mia - Three-Universe Intelligence",
        "properties": {
          "mia.enabled": { "type": "boolean", "default": true, "description": "Enable Mia narrative intelligence" },
          "mia.universes.engineer": { "type": "boolean", "default": true, "description": "Enable Engineer universe (Mia)" },
          "mia.universes.ceremony": { "type": "boolean", "default": true, "description": "Enable Ceremony universe (Ava)" },
          "mia.universes.story": { "type": "boolean", "default": true, "description": "Enable Story universe (Miette)" },
          "mia.engine.default": { "type": "string", "enum": ["claude", "gemini", "ollama"], "default": "claude", "description": "Default LLM engine" },
          "mia.engine.model": { "type": "string", "default": "sonnet", "description": "Default model for the selected engine" },
          "mia.analysis.autoOnSave": { "type": "boolean", "default": false, "description": "Auto-analyze files on save" },
          "mia.analysis.depth": { "type": "string", "enum": ["quick", "standard", "deep"], "default": "standard" },
          "mia.stc.showInStatusBar": { "type": "boolean", "default": true },
          "mia.storyMonitor.enabled": { "type": "boolean", "default": true },
          "mia.storyMonitor.significance": { "type": "number", "default": 0.3, "description": "Minimum significance for beat display" },
          "mia.decorations.level": { "type": "string", "enum": ["off", "minimal", "full"], "default": "minimal" },
          "mia.tracing.enabled": { "type": "boolean", "default": false },
          "mia.tracing.langfuseUrl": { "type": "string" }
        }
      }
    }
  }
  ```

---

## Supporting Structures
- Settings synced with server config on change
- Configuration API reads from both VS Code settings and server config
- Settings migration for version upgrades
