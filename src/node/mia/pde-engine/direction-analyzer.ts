/**
 * DirectionAnalyzer — Maps intents and actions to the Four Directions (Medicine Wheel)
 *
 * Classifies intents into:
 * - North: Vision, Strategy, Big Picture
 * - East: New Beginnings, Innovation, Sunrise
 * - South: Trust, Community, Nurture
 * - West: Reflection, Completion, Integration
 *
 * Computes energy distribution across directions and identifies imbalances.
 */

import {
  Intent,
  Direction,
  FourDirections,
  DIRECTION_KEYWORDS,
} from "./types"

/**
 * Computes how strongly a text aligns with a given direction.
 * Returns a score 0-1 based on keyword matches.
 */
export function computeDirectionScore(text: string, direction: Direction): number {
  const lower = text.toLowerCase()
  const keywords = DIRECTION_KEYWORDS[direction]
  const matches = keywords.filter((kw) => lower.includes(kw)).length
  // Normalize: cap at 1.0, with each keyword contributing proportionally
  return Math.min(1.0, matches / 3)
}

/**
 * Determines the best-fit direction for a given intent.
 * Returns the direction with the highest score, defaulting to "east" (creation/action).
 */
export function classifyDirection(text: string): Direction {
  const directions: Direction[] = ["north", "east", "south", "west"]
  let bestDirection: Direction = "east" // Default: creation/action
  let bestScore = 0

  for (const dir of directions) {
    const score = computeDirectionScore(text, dir)
    if (score > bestScore) {
      bestScore = score
      bestDirection = dir
    }
  }

  return bestDirection
}

/**
 * Creates an empty FourDirections structure.
 */
export function emptyFourDirections(): FourDirections {
  return {
    north: { intents: [], energy_level: 0, balance_note: "" },
    east: { intents: [], energy_level: 0, balance_note: "" },
    south: { intents: [], energy_level: 0, balance_note: "" },
    west: { intents: [], energy_level: 0, balance_note: "" },
  }
}

/**
 * Direction labels for human-readable output.
 */
const DIRECTION_LABELS: Record<Direction, string> = {
  north: "Vision & Strategy",
  east: "Innovation & Creation",
  south: "Trust & Community",
  west: "Reflection & Integration",
}

export class DirectionAnalyzer {
  /**
   * Analyzes intents and produces a complete FourDirections mapping.
   */
  analyze(intents: Intent[]): FourDirections {
    const directions = emptyFourDirections()

    if (intents.length === 0) {
      this.addBalanceNotes(directions)
      return directions
    }

    // Classify each intent into its best-fit direction
    for (const intent of intents) {
      const dir = classifyDirection(intent.description)
      directions[dir].intents.push(intent.description)
    }

    // Compute energy levels based on intent distribution
    const totalIntents = intents.length
    const directionKeys: Direction[] = ["north", "east", "south", "west"]

    for (const dir of directionKeys) {
      const mapping = directions[dir]
      mapping.energy_level = totalIntents > 0 ? mapping.intents.length / totalIntents : 0
    }

    // Add balance notes
    this.addBalanceNotes(directions)

    return directions
  }

  /**
   * Adds descriptive balance notes to each direction mapping.
   */
  private addBalanceNotes(directions: FourDirections): void {
    const directionKeys: Direction[] = ["north", "east", "south", "west"]

    for (const dir of directionKeys) {
      const mapping = directions[dir]
      const label = DIRECTION_LABELS[dir]

      if (mapping.intents.length === 0) {
        mapping.balance_note = `No ${label} energy detected — consider if this direction needs attention`
      } else if (mapping.energy_level > 0.5) {
        mapping.balance_note = `Strong ${label} presence — dominant direction`
      } else if (mapping.energy_level > 0.25) {
        mapping.balance_note = `Healthy ${label} energy — well represented`
      } else {
        mapping.balance_note = `Light ${label} presence — may benefit from more attention`
      }
    }
  }
}
