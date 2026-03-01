/**
 * CoherenceSynthesizer — Combines three lens outputs into unified response
 *
 * Receives outputs from all active universe lenses, calculates a weighted
 * coherence score, identifies agreements and tensions between lenses,
 * and generates a synthesis narrative.
 *
 * Weights: engineer 40%, ceremony 30%, story 30% (configurable)
 */

import {
  LensOutput,
  UniverseName,
  Synthesis,
  TensionPoint,
  Agreement,
  UniverseWeights,
  DEFAULT_WEIGHTS,
} from "./types"

/** Score difference threshold to detect tension between universes */
const TENSION_THRESHOLD = 0.3

/** Score similarity threshold to detect agreement between universes */
const AGREEMENT_THRESHOLD = 0.15

export class CoherenceSynthesizer {
  private readonly weights: UniverseWeights

  constructor(weights?: Partial<UniverseWeights>) {
    this.weights = { ...DEFAULT_WEIGHTS, ...weights }
  }

  /**
   * Synthesize outputs from multiple universe lenses into a unified response.
   */
  synthesize(outputs: LensOutput[]): Synthesis {
    if (outputs.length === 0) {
      return this.emptySynthesis()
    }

    const coherenceScore = this.calculateCoherence(outputs)
    const tensions = this.detectTensions(outputs)
    const agreements = this.detectAgreements(outputs)
    const dominantUniverse = this.findDominant(outputs)
    const narrative = this.buildNarrative(outputs, coherenceScore, tensions, agreements)
    const recommendation = this.buildRecommendation(coherenceScore, tensions, dominantUniverse)

    return {
      narrative,
      coherenceScore,
      tensions,
      agreements,
      dominantUniverse,
      recommendation,
    }
  }

  // --- Private methods ---

  private calculateCoherence(outputs: LensOutput[]): number {
    // Weighted average of scores
    let weightedSum = 0
    let totalWeight = 0

    for (const output of outputs) {
      const weight = this.weights[output.universe as UniverseName] ?? 0.33
      weightedSum += output.score * weight
      totalWeight += weight
    }

    if (totalWeight === 0) return 0

    const weightedAvg = weightedSum / totalWeight

    // Penalize for high variance (incoherence between universes)
    const scores = outputs.map((o) => o.score)
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length
    const variance = scores.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / scores.length
    const coherencePenalty = Math.min(0.3, variance)

    return Math.max(0, Math.min(1, weightedAvg - coherencePenalty))
  }

  private detectTensions(outputs: LensOutput[]): TensionPoint[] {
    const tensions: TensionPoint[] = []

    for (let i = 0; i < outputs.length; i++) {
      for (let j = i + 1; j < outputs.length; j++) {
        const diff = Math.abs(outputs[i].score - outputs[j].score)
        if (diff >= TENSION_THRESHOLD) {
          const higher = outputs[i].score > outputs[j].score ? outputs[i] : outputs[j]
          const lower = outputs[i].score > outputs[j].score ? outputs[j] : outputs[i]

          tensions.push({
            between: [higher.universe as UniverseName, lower.universe as UniverseName],
            description: `${higher.universe} scores significantly higher than ${lower.universe} (${diff.toFixed(2)} gap)`,
            severity: diff > 0.5 ? "high" : "medium",
          })
        }
      }
    }

    return tensions
  }

  private detectAgreements(outputs: LensOutput[]): Agreement[] {
    const agreements: Agreement[] = []

    // Check for overall agreement (all scores within threshold)
    if (outputs.length >= 2) {
      const scores = outputs.map((o) => o.score)
      const min = Math.min(...scores)
      const max = Math.max(...scores)

      if (max - min <= AGREEMENT_THRESHOLD) {
        agreements.push({
          universes: outputs.map((o) => o.universe as UniverseName),
          description: `All universes agree (scores within ${AGREEMENT_THRESHOLD} of each other)`,
        })
      }
    }

    // Check pairwise agreements
    for (let i = 0; i < outputs.length; i++) {
      for (let j = i + 1; j < outputs.length; j++) {
        const diff = Math.abs(outputs[i].score - outputs[j].score)
        if (diff <= AGREEMENT_THRESHOLD) {
          // Only add pairwise if there wasn't a full agreement
          if (agreements.length === 0 || outputs.length > 2) {
            agreements.push({
              universes: [outputs[i].universe as UniverseName, outputs[j].universe as UniverseName],
              description: `${outputs[i].universe} and ${outputs[j].universe} are in alignment`,
            })
          }
        }
      }
    }

    return agreements
  }

  private findDominant(outputs: LensOutput[]): UniverseName | null {
    if (outputs.length === 0) return null

    let dominant = outputs[0]
    for (const output of outputs) {
      if (output.score > dominant.score) {
        dominant = output
      }
    }

    // Only report dominance if it's clearly ahead
    const others = outputs.filter((o) => o.universe !== dominant.universe)
    const clearlyDominant = others.every((o) => dominant.score - o.score > 0.1)

    return clearlyDominant ? (dominant.universe as UniverseName) : null
  }

  private buildNarrative(
    outputs: LensOutput[],
    coherence: number,
    tensions: TensionPoint[],
    agreements: Agreement[],
  ): string {
    const parts: string[] = []

    // Coherence summary
    if (coherence > 0.7) {
      parts.push("The three universes speak in harmony.")
    } else if (coherence > 0.4) {
      parts.push("The universes find partial agreement with productive tensions.")
    } else {
      parts.push("Significant divergence between universes — attention needed.")
    }

    // Add lens summaries
    for (const output of outputs) {
      parts.push(output.assessment)
    }

    // Tension narrative
    if (tensions.length > 0) {
      const tensionDescs = tensions.map((t) => t.description).join("; ")
      parts.push(`Tensions: ${tensionDescs}.`)
    }

    return parts.join(" ")
  }

  private buildRecommendation(
    coherence: number,
    tensions: TensionPoint[],
    dominant: UniverseName | null,
  ): string {
    if (coherence > 0.7 && tensions.length === 0) {
      return "Proceed with confidence — all perspectives are aligned."
    }

    if (tensions.some((t) => t.severity === "high")) {
      return "Address high-severity tensions before proceeding — the universes have important disagreements."
    }

    if (dominant) {
      const balance: Record<UniverseName, string> = {
        engineer: "Bring ceremony and story perspectives to balance technical focus.",
        ceremony: "Ensure technical rigor matches relational awareness.",
        story: "Ground the narrative in concrete technical and relational action.",
      }
      return balance[dominant]
    }

    return "Consider each universe's perspective before deciding on approach."
  }

  private emptySynthesis(): Synthesis {
    return {
      narrative: "No universe lenses were activated.",
      coherenceScore: 0,
      tensions: [],
      agreements: [],
      dominantUniverse: null,
      recommendation: "Activate at least one universe lens for analysis.",
    }
  }
}
