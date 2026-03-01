/**
 * GerminationMetrics — Tracks the health of the PDE germination process
 *
 * Monitors the creative germination phase (Fritz's process):
 * - Time spent germinating (too long = over-planning risk)
 * - Edit engagement (number of edits = creative involvement)
 * - Directional balance (Four Directions equilibrium)
 * - Intent clarity (confidence score trends)
 *
 * Provides recommendations for when to transition from germination
 * to assimilation (from planning to doing).
 */

import {
  SteerableDecomposition,
  GerminationHealth,
  Direction,
} from "./types"

/** Maximum recommended germination time before suggesting transition (15 minutes) */
const MAX_GERMINATION_MS = 15 * 60 * 1000

/** Minimum edits suggesting healthy engagement */
const MIN_HEALTHY_EDITS = 2

/** Stall detection: no edits in this window suggests germination stalled */
const STALL_WINDOW_MS = 5 * 60 * 1000

export class GerminationMetrics {
  /**
   * Assess the health of a steerable decomposition's germination process.
   */
  assess(decomposition: SteerableDecomposition): GerminationHealth {
    const germinationTimeMs = this.computeGerminationTime(decomposition)
    const editCount = decomposition.steerableState.editHistory.length
    const directionBalance = this.computeDirectionBalance(decomposition)
    const intentClarity = this.computeIntentClarity(decomposition)
    const isStalled = this.detectStall(decomposition)

    const recommendation = this.recommend(
      germinationTimeMs,
      editCount,
      directionBalance,
      intentClarity,
      isStalled,
      decomposition.steerableState.phase,
    )

    return {
      germinationTimeMs,
      editCount,
      directionBalance,
      intentClarity,
      isStalled,
      recommendation,
    }
  }

  // --- Private helpers ---

  private computeGerminationTime(decomposition: SteerableDecomposition): number {
    const created = new Date(decomposition.timestamp).getTime()
    const now = Date.now()
    return now - created
  }

  private computeDirectionBalance(decomposition: SteerableDecomposition): number {
    const directions: Direction[] = ["north", "east", "south", "west"]
    const idealEnergy = 0.25
    let totalDeviation = 0

    for (const dir of directions) {
      totalDeviation += Math.abs(decomposition.four_directions[dir].energy_level - idealEnergy)
    }

    // Max deviation is 1.5 (one at 1.0, others at 0). Health = 1 - normalized deviation.
    return Math.max(0, 1 - totalDeviation / 1.5)
  }

  private computeIntentClarity(decomposition: SteerableDecomposition): number {
    const allIntents = [
      ...decomposition.primary_intents,
      ...decomposition.secondary_intents,
      ...decomposition.implicit_intents,
    ]

    if (allIntents.length === 0) return 0

    const totalConfidence = allIntents.reduce((sum, intent) => sum + intent.confidence, 0)
    return totalConfidence / allIntents.length
  }

  private detectStall(decomposition: SteerableDecomposition): boolean {
    const history = decomposition.steerableState.editHistory
    if (history.length === 0) {
      // No edits at all — check if it's been a while since creation
      const age = Date.now() - new Date(decomposition.timestamp).getTime()
      return age > STALL_WINDOW_MS
    }

    // Check if last edit was too long ago
    const lastEdit = history[history.length - 1]
    const timeSinceLastEdit = Date.now() - new Date(lastEdit.timestamp).getTime()
    return timeSinceLastEdit > STALL_WINDOW_MS
  }

  private recommend(
    germinationTimeMs: number,
    editCount: number,
    directionBalance: number,
    intentClarity: number,
    isStalled: boolean,
    phase: string,
  ): GerminationHealth["recommendation"] {
    // Already finalized — no recommendation needed
    if (phase === "finalized") {
      return "transition-to-assimilation"
    }

    // Stalled with good metrics — ready to move on
    if (isStalled && intentClarity > 0.7 && directionBalance > 0.5) {
      return "transition-to-assimilation"
    }

    // Over-planning: too much time, sufficient edits
    if (germinationTimeMs > MAX_GERMINATION_MS && editCount >= MIN_HEALTHY_EDITS) {
      return "transition-to-assimilation"
    }

    // Low clarity — need more intent refinement
    if (intentClarity < 0.5) {
      return "clarify-intents"
    }

    // Imbalanced directions
    if (directionBalance < 0.3) {
      return "rebalance"
    }

    return "continue"
  }
}
