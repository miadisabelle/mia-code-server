/**
 * NarrativeFramer — Wraps workflow steps in Creative Orientation narrative
 *
 * Generates narrative framing for workflow execution:
 * - Beat templates from action descriptions
 * - Session intent from primary intents
 * - Completion narratives from desired outcomes
 *
 * Uses Creative Orientation language (Robert Fritz):
 * the creator's stance is "I am creating X" not "I am reacting to Y".
 */

import {
  Intent,
  NarrativeBeat,
  UniverseAssignment,
  Action,
} from "./types"

export class NarrativeFramer {
  /**
   * Derive session intent from primary intents — the creative statement.
   * Uses Creative Orientation: "Creating..." not "Fixing..." or "Avoiding..."
   */
  deriveSessionIntent(primaryIntents: Intent[]): string {
    if (primaryIntents.length === 0) {
      return "Creating something meaningful"
    }

    const descriptions = primaryIntents.map((i) => i.description)

    if (descriptions.length === 1) {
      return this.toCreativeOrientation(descriptions[0])
    }

    // Combine multiple intents into a cohesive creative statement
    const primary = this.toCreativeOrientation(descriptions[0])
    const supporting = descriptions.slice(1).map((d) => d.toLowerCase()).join(", ")
    return `${primary} — with ${supporting}`
  }

  /**
   * Generate a narrative beat template for a workflow step.
   */
  generateBeat(action: Action, universe: UniverseAssignment): NarrativeBeat {
    const template = this.buildBeatTemplate(action.description, universe)
    const phase = this.inferBeatPhase(action)

    return {
      template,
      universe,
      phase,
    }
  }

  /**
   * Generate a completion narrative from the overall decomposition.
   * Describes what was created, not what was avoided.
   */
  generateCompletionNarrative(primaryIntents: Intent[], actionCount: number): string {
    if (primaryIntents.length === 0) {
      return "The work is complete — something new exists in the world."
    }

    const mainGoal = primaryIntents[0].description
    const creative = this.toCreativeOrientation(mainGoal)

    if (actionCount <= 1) {
      return `${creative} — the creation stands complete.`
    }

    return `Through ${actionCount} deliberate steps, ${creative.toLowerCase()} — the vision is now reality.`
  }

  // --- Private helpers ---

  /**
   * Transforms reactive language into Creative Orientation language.
   * "Fix the broken tests" → "Creating reliable test coverage"
   * "Remove the old code" → "Creating a cleaner codebase"
   */
  private toCreativeOrientation(description: string): string {
    const lower = description.toLowerCase().trim()

    // Already creative orientation
    if (lower.startsWith("creat") || lower.startsWith("build") || lower.startsWith("design")) {
      return this.capitalize(description)
    }

    // Transform reactive patterns
    const reactiveTransforms: Array<{ pattern: RegExp; transform: string }> = [
      { pattern: /^fix\w*\s+/i, transform: "Creating a resolved state for" },
      { pattern: /^remove\s+/i, transform: "Creating space by clearing" },
      { pattern: /^delete\s+/i, transform: "Creating clarity by removing" },
      { pattern: /^refactor\s+/i, transform: "Creating a refined version of" },
      { pattern: /^clean\s+/i, transform: "Creating cleanliness in" },
      { pattern: /^update\s+/i, transform: "Creating an evolved version of" },
      { pattern: /^migrate\s+/i, transform: "Creating a new home for" },
    ]

    for (const { pattern, transform } of reactiveTransforms) {
      if (pattern.test(lower)) {
        const remainder = description.replace(pattern, "").trim()
        return `${transform} ${remainder}`
      }
    }

    // Default: prepend "Creating"
    return `Creating ${lower}`
  }

  /**
   * Builds a beat template string for a workflow step.
   */
  private buildBeatTemplate(description: string, universe: UniverseAssignment): string {
    const universeFraming: Record<UniverseAssignment, string> = {
      engineer: "The engineer's hand moves",
      ceremony: "A moment of ceremony",
      story: "The story unfolds",
    }

    return `${universeFraming[universe]}: ${description.toLowerCase()}`
  }

  /**
   * Infer the beat phase from action context.
   */
  private inferBeatPhase(action: Action): "setup" | "action" | "resolution" {
    const lower = action.description.toLowerCase()
    const setupKeywords = ["setup", "configure", "install", "prepare", "initialize", "create"]
    const resolutionKeywords = ["test", "validate", "verify", "deploy", "complete", "finish", "review"]

    if (setupKeywords.some((kw) => lower.includes(kw))) {
      return "setup"
    }
    if (resolutionKeywords.some((kw) => lower.includes(kw))) {
      return "resolution"
    }
    return "action"
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }
}
