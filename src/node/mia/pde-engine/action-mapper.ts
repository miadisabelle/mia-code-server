/**
 * ActionMapper — Maps abstract PDE actions to concrete platform operations
 *
 * Bridges the gap between PDE's action descriptions (natural language)
 * and the platform's actual capabilities (file ops, test runner, etc.).
 *
 * Extensible via addMapping() for custom action patterns.
 */

import {
  Action,
  ActionMapping,
  ActionMappingTarget,
  UniverseAssignment,
} from "./types"

/**
 * Default action mapping registry.
 * Pattern strings are matched case-insensitively against action descriptions.
 */
const DEFAULT_MAPPINGS: ActionMapping[] = [
  // File system operations
  { pattern: "create file", target: "file-system", universe: "engineer" },
  { pattern: "write file", target: "file-system", universe: "engineer" },
  { pattern: "modify file", target: "file-system", universe: "engineer" },
  { pattern: "delete file", target: "file-system", universe: "engineer" },
  { pattern: "move file", target: "file-system", universe: "engineer" },
  { pattern: "rename", target: "file-system", universe: "engineer" },

  // Test operations
  { pattern: "run tests", target: "test-runner", universe: "engineer" },
  { pattern: "test", target: "test-runner", universe: "story" },
  { pattern: "validate", target: "test-runner", universe: "story" },
  { pattern: "verify", target: "test-runner", universe: "story" },

  // Three-universe analysis
  { pattern: "analyze", target: "three-universe-analysis", universe: "ceremony" },
  { pattern: "review", target: "three-universe-analysis", universe: "ceremony" },
  { pattern: "assess", target: "three-universe-analysis", universe: "ceremony" },

  // PR workflow
  { pattern: "pull request", target: "pr-workflow", universe: "ceremony" },
  { pattern: "pr", target: "pr-workflow", universe: "ceremony" },
  { pattern: "merge", target: "pr-workflow", universe: "ceremony" },

  // Build operations
  { pattern: "build", target: "build", universe: "engineer" },
  { pattern: "compile", target: "build", universe: "engineer" },
  { pattern: "bundle", target: "build", universe: "engineer" },

  // Code generation
  { pattern: "implement", target: "code-generation", universe: "engineer" },
  { pattern: "create", target: "code-generation", universe: "engineer" },
  { pattern: "generate", target: "code-generation", universe: "engineer" },
  { pattern: "setup", target: "code-generation", universe: "engineer" },
  { pattern: "add", target: "code-generation", universe: "engineer" },

  // Documentation
  { pattern: "document", target: "documentation", universe: "story" },
  { pattern: "readme", target: "documentation", universe: "story" },
  { pattern: "write docs", target: "documentation", universe: "story" },

  // Configuration
  { pattern: "configure", target: "configuration", universe: "engineer" },
  { pattern: "config", target: "configuration", universe: "engineer" },
  { pattern: "install", target: "configuration", universe: "engineer" },
  { pattern: "deploy", target: "configuration", universe: "engineer" },
  { pattern: "migrate", target: "configuration", universe: "engineer" },
]

export interface ActionMapResult {
  target: ActionMappingTarget
  universe: UniverseAssignment
  isManual: boolean
}

export class ActionMapper {
  private readonly mappings: ActionMapping[]

  constructor() {
    this.mappings = [...DEFAULT_MAPPINGS]
  }

  /**
   * Add a custom action mapping to the registry.
   */
  addMapping(mapping: ActionMapping): void {
    this.mappings.unshift(mapping) // Custom mappings take priority
  }

  /**
   * Map an action description to a platform operation.
   * Returns the best-matching target, or "manual" if no match found.
   */
  map(action: Action): ActionMapResult {
    const lower = action.description.toLowerCase()

    for (const mapping of this.mappings) {
      if (lower.includes(mapping.pattern.toLowerCase())) {
        return {
          target: mapping.target,
          universe: mapping.universe,
          isManual: false,
        }
      }
    }

    return {
      target: "manual",
      universe: "engineer",
      isManual: true,
    }
  }

  /**
   * Map all actions in a stack, returning results keyed by action ID.
   */
  mapAll(actions: Action[]): Map<string, ActionMapResult> {
    const results = new Map<string, ActionMapResult>()
    for (const action of actions) {
      results.set(action.id, this.map(action))
    }
    return results
  }

  /**
   * Get the count of unmapped (manual) actions.
   */
  countUnmapped(actions: Action[]): number {
    return actions.filter((a) => this.map(a).isManual).length
  }
}
