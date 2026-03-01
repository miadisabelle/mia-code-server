/**
 * BalanceAdvisor — Advises on directional balance for project health
 *
 * When decomposition is heavily weighted in one direction,
 * suggests balancing actions. Detects imbalances and generates
 * specific recommendations to restore holistic project health.
 *
 * Balance check is recommended for large decompositions.
 */

import {
  Direction,
  FourDirections,
  BalanceRecommendation,
  BalanceReport,
} from "./types"

/** Threshold below which a direction is considered underweight */
const UNDERWEIGHT_THRESHOLD = 0.1

/** Threshold above which a direction is considered overweight */
const OVERWEIGHT_THRESHOLD = 0.5

/** Suggestions for balancing each direction */
const BALANCE_SUGGESTIONS: Record<Direction, { underweight: string; overweight: string }> = {
  north: {
    underweight:
      "Consider adding strategic planning or architectural vision to ground the work in long-term goals",
    overweight:
      "Rich in vision — ensure action items translate strategy into concrete implementation steps",
  },
  east: {
    underweight:
      "The work may benefit from creative exploration or prototyping new approaches",
    overweight:
      "Strong creative energy — balance with reflection and quality assurance to sustain innovation",
  },
  south: {
    underweight:
      "Consider adding testing, documentation, or team collaboration to build trust and reliability",
    overweight:
      "Strong community focus — ensure enough forward momentum with vision and innovation",
  },
  west: {
    underweight:
      "Add reflection activities like code review, refactoring, or retrospective to integrate learnings",
    overweight:
      "Heavy in reflection — balance with new creation and forward movement to avoid stagnation",
  },
}

export class BalanceAdvisor {
  /**
   * Generates a complete balance report for a FourDirections mapping.
   */
  assess(directions: FourDirections): BalanceReport {
    const directionKeys: Direction[] = ["north", "east", "south", "west"]
    const recommendations: BalanceRecommendation[] = []

    let dominantDirection: Direction | null = null
    let weakestDirection: Direction | null = null
    let maxEnergy = -1
    let minEnergy = 2

    for (const dir of directionKeys) {
      const energy = directions[dir].energy_level

      if (energy > maxEnergy) {
        maxEnergy = energy
        dominantDirection = dir
      }
      if (energy < minEnergy) {
        minEnergy = energy
        weakestDirection = dir
      }

      // Check for imbalances
      if (energy === 0 && directions[dir].intents.length === 0) {
        recommendations.push({
          direction: dir,
          issue: "absent",
          energy_level: energy,
          suggestion: BALANCE_SUGGESTIONS[dir].underweight,
        })
      } else if (energy < UNDERWEIGHT_THRESHOLD) {
        recommendations.push({
          direction: dir,
          issue: "underweight",
          energy_level: energy,
          suggestion: BALANCE_SUGGESTIONS[dir].underweight,
        })
      } else if (energy > OVERWEIGHT_THRESHOLD) {
        recommendations.push({
          direction: dir,
          issue: "overweight",
          energy_level: energy,
          suggestion: BALANCE_SUGGESTIONS[dir].overweight,
        })
      }
    }

    // Compute overall health: perfect balance = 0.25 in each direction
    // Health = 1 - normalized deviation from perfect balance
    const idealEnergy = 0.25
    let totalDeviation = 0
    for (const dir of directionKeys) {
      totalDeviation += Math.abs(directions[dir].energy_level - idealEnergy)
    }
    // Max possible deviation is 1.5 (one direction at 1.0, others at 0)
    const overallHealth = Math.max(0, 1 - totalDeviation / 1.5)

    const isBalanced = recommendations.length === 0

    return {
      isBalanced,
      dominantDirection: maxEnergy > 0 ? dominantDirection : null,
      weakestDirection: minEnergy < 1 ? weakestDirection : null,
      recommendations,
      overallHealth,
    }
  }
}
