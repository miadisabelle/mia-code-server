/**
 * StoryLens — Narrative coherence analysis lens
 *
 * Analyzes input through the story perspective:
 * arc coherence, character consistency, thematic threading,
 * plot phase detection, and narrative momentum.
 *
 * Default implementation uses rule-based keyword analysis.
 */

import { UniverseLens, LensInput, LensOutput } from "../types"

const ARC_KEYWORDS = [
  "beginning", "middle", "end", "climax", "resolution",
  "setup", "conflict", "journey", "arc", "progression",
]

const COHERENCE_KEYWORDS = [
  "consistent", "flow", "thread", "connection", "continuity",
  "theme", "pattern", "rhythm", "narrative", "story",
]

const CHARACTER_KEYWORDS = [
  "role", "voice", "perspective", "persona", "character",
  "identity", "growth", "change", "development", "evolve",
]

const TENSION_KEYWORDS = [
  "tension", "conflict", "challenge", "obstacle", "problem",
  "gap", "struggle", "contradiction", "friction", "dilemma",
]

export class StoryLens implements UniverseLens {
  readonly universe = "story" as const
  readonly name = "Story — Narrative Coherence"

  async analyze(input: LensInput): Promise<LensOutput> {
    const lower = input.text.toLowerCase()

    const arcHits = ARC_KEYWORDS.filter((kw) => lower.includes(kw)).length
    const coherenceHits = COHERENCE_KEYWORDS.filter((kw) => lower.includes(kw)).length
    const characterHits = CHARACTER_KEYWORDS.filter((kw) => lower.includes(kw)).length
    const tensionHits = TENSION_KEYWORDS.filter((kw) => lower.includes(kw)).length

    // Story score: balanced narrative has arc, coherence, character, and productive tension
    const narrativeSignals = arcHits + coherenceHits + characterHits
    const narrativeScore = Math.min(1, narrativeSignals / 4)
    const tensionBonus = Math.min(0.2, tensionHits * 0.05) // Some tension is good for story

    const score = Math.max(0, Math.min(1, 0.5 + narrativeScore * 0.3 + tensionBonus))

    const suggestions: string[] = []
    if (arcHits === 0) suggestions.push("Consider the narrative arc — where does this fit in the larger story?")
    if (coherenceHits === 0) suggestions.push("Thread this work into the ongoing narrative for coherence")
    if (tensionHits === 0) suggestions.push("Name the creative tension driving this work forward")

    const assessment = this.buildAssessment(score, arcHits, coherenceHits, tensionHits, input.depth)

    return {
      universe: "story",
      assessment,
      score,
      details: {
        arcIndicators: arcHits,
        coherenceIndicators: coherenceHits,
        characterIndicators: characterHits,
        tensionIndicators: tensionHits,
      },
      suggestions: suggestions.length > 0 ? suggestions : undefined,
    }
  }

  private buildAssessment(
    score: number,
    arc: number,
    coherence: number,
    tension: number,
    depth: string,
  ): string {
    if (depth === "quick") {
      return score > 0.7 ? "Narratively coherent." : "Needs narrative grounding."
    }

    const parts: string[] = []
    if (arc > 0) parts.push(`${arc} arc marker(s) detected`)
    if (coherence > 0) parts.push(`${coherence} coherence thread(s)`)
    if (tension > 0) parts.push(`${tension} tension point(s) — productive narrative energy`)

    if (parts.length === 0) {
      return "No narrative signals detected — consider what story this work tells."
    }

    return `Story assessment (score: ${score.toFixed(2)}): ${parts.join("; ")}.`
  }
}
