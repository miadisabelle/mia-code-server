/**
 * CeremonyLens — Relational accountability analysis lens
 *
 * Analyzes input through the ceremony perspective:
 * relational impact, sacred pause, accountability,
 * ritual completion, and community consideration.
 *
 * Default implementation uses rule-based keyword analysis.
 */

import { UniverseLens, LensInput, LensOutput } from "../types"

const RELATION_KEYWORDS = [
  "team", "collaborate", "pair", "review", "feedback",
  "share", "communicate", "meeting", "discuss", "agree",
]

const ACCOUNTABILITY_KEYWORDS = [
  "responsible", "own", "commit", "promise", "deliver",
  "track", "measure", "report", "transparent", "accountable",
]

const CEREMONY_KEYWORDS = [
  "ritual", "ceremony", "celebrate", "acknowledge", "honor",
  "pause", "reflect", "gratitude", "intention", "sacred",
]

const RISK_KEYWORDS = [
  "rush", "skip", "ignore", "bypass", "shortcut",
  "alone", "solo", "silent", "hidden", "secret",
]

export class CeremonyLens implements UniverseLens {
  readonly universe = "ceremony" as const
  readonly name = "Ceremony — Relational Accountability"

  async analyze(input: LensInput): Promise<LensOutput> {
    const lower = input.text.toLowerCase()

    const relationHits = RELATION_KEYWORDS.filter((kw) => lower.includes(kw)).length
    const accountHits = ACCOUNTABILITY_KEYWORDS.filter((kw) => lower.includes(kw)).length
    const ceremonyHits = CEREMONY_KEYWORDS.filter((kw) => lower.includes(kw)).length
    const riskHits = RISK_KEYWORDS.filter((kw) => lower.includes(kw)).length

    const relationalScore = Math.min(1, (relationHits + accountHits + ceremonyHits) / 4)
    const riskPenalty = Math.min(0.4, riskHits * 0.1)

    const score = Math.max(0, Math.min(1, 0.5 + relationalScore * 0.3 - riskPenalty))

    const suggestions: string[] = []
    if (relationHits === 0) suggestions.push("Consider team impact and collaboration touchpoints")
    if (ceremonyHits === 0) suggestions.push("Add a moment of ceremony — acknowledge the work and its makers")
    if (riskHits > 0) suggestions.push("Slow down — the rush markers suggest skipping relational steps")

    const assessment = this.buildAssessment(score, relationHits, ceremonyHits, riskHits, input.depth)

    return {
      universe: "ceremony",
      assessment,
      score,
      details: {
        relationalIndicators: relationHits,
        accountabilityIndicators: accountHits,
        ceremonyIndicators: ceremonyHits,
        rushIndicators: riskHits,
      },
      suggestions: suggestions.length > 0 ? suggestions : undefined,
    }
  }

  private buildAssessment(
    score: number,
    relations: number,
    ceremony: number,
    risks: number,
    depth: string,
  ): string {
    if (depth === "quick") {
      return score > 0.7 ? "Relationally grounded." : "Needs relational attention."
    }

    const parts: string[] = []
    if (relations > 0) parts.push(`${relations} relational touchpoint(s)`)
    if (ceremony > 0) parts.push(`${ceremony} ceremonial marker(s)`)
    if (risks > 0) parts.push(`${risks} rush indicator(s) — consider sacred pause`)

    if (parts.length === 0) {
      return "No relational signals detected — consider who is affected and how to honor the work."
    }

    return `Ceremony assessment (score: ${score.toFixed(2)}): ${parts.join("; ")}.`
  }
}
