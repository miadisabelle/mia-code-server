/**
 * EngineerLens — Technical analysis lens
 *
 * Analyzes input through the engineering perspective:
 * code quality, type safety, performance, architecture,
 * patterns, and technical debt.
 *
 * Default implementation uses rule-based keyword analysis.
 * Can be replaced with LLM-backed implementation.
 */

import { UniverseLens, LensInput, LensOutput } from "../types"

const QUALITY_KEYWORDS = [
  "type-safe", "typed", "generic", "interface", "abstract",
  "solid", "dry", "clean", "modular", "composable",
]

const RISK_KEYWORDS = [
  "any", "todo", "hack", "workaround", "temporary",
  "deprecated", "unsafe", "mutation", "side effect", "global",
]

const ARCHITECTURE_KEYWORDS = [
  "pattern", "layer", "service", "module", "component",
  "dependency injection", "factory", "observer", "strategy",
  "separation of concerns", "single responsibility",
]

export class EngineerLens implements UniverseLens {
  readonly universe = "engineer" as const
  readonly name = "Engineer — Technical Precision"

  async analyze(input: LensInput): Promise<LensOutput> {
    const lower = input.text.toLowerCase()

    const qualityHits = QUALITY_KEYWORDS.filter((kw) => lower.includes(kw)).length
    const riskHits = RISK_KEYWORDS.filter((kw) => lower.includes(kw)).length
    const archHits = ARCHITECTURE_KEYWORDS.filter((kw) => lower.includes(kw)).length

    const qualityScore = Math.min(1, qualityHits / 3)
    const riskPenalty = Math.min(0.5, riskHits * 0.1)
    const archBonus = Math.min(0.3, archHits * 0.1)

    const score = Math.max(0, Math.min(1, 0.5 + qualityScore * 0.3 + archBonus - riskPenalty))

    const suggestions: string[] = []
    if (riskHits > 0) suggestions.push("Address technical debt markers (TODO, hack, workaround)")
    if (archHits === 0) suggestions.push("Consider architectural patterns for better structure")
    if (qualityHits === 0) suggestions.push("Apply type safety and clean code principles")

    const assessment = this.buildAssessment(score, qualityHits, riskHits, archHits, input.depth)

    return {
      universe: "engineer",
      assessment,
      score,
      details: {
        qualityIndicators: qualityHits,
        riskIndicators: riskHits,
        architectureIndicators: archHits,
      },
      suggestions: suggestions.length > 0 ? suggestions : undefined,
    }
  }

  private buildAssessment(
    score: number,
    quality: number,
    risks: number,
    arch: number,
    depth: string,
  ): string {
    if (depth === "quick") {
      return score > 0.7 ? "Technically sound." : "Needs technical attention."
    }

    const parts: string[] = []
    if (quality > 0) parts.push(`${quality} quality indicator(s) detected`)
    if (risks > 0) parts.push(`${risks} risk marker(s) found`)
    if (arch > 0) parts.push(`${arch} architectural pattern(s) present`)

    if (parts.length === 0) {
      return "No strong technical signals detected — consider adding type safety and architectural patterns."
    }

    return `Engineering assessment (score: ${score.toFixed(2)}): ${parts.join("; ")}.`
  }
}
