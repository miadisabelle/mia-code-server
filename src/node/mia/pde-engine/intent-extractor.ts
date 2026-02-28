/**
 * IntentExtractor — Three-layer intent extraction from natural language
 *
 * Extracts layered intents from prompts:
 * 1. Primary — explicitly stated goals
 * 2. Secondary — implied requirements for primary goals
 * 3. Implicit — unstated but desired outcomes (detected from hedging/qualifiers)
 *
 * Each intent includes confidence, keywords, and estimated complexity.
 */

import * as crypto from "crypto"
import {
  Intent,
  IntentLayer,
  ComplexityEstimate,
  COMPLEXITY_KEYWORDS,
  HEDGING_PATTERNS,
} from "./types"

function generateIntentId(): string {
  return `intent-${crypto.randomUUID().slice(0, 8)}`
}

/**
 * Splits a prompt into individual sentences/clauses for analysis.
 * Handles common delimiters: periods, semicolons, newlines, and numbered lists.
 */
export function splitIntoClauses(text: string): string[] {
  return text
    .split(/[.;!\n]+|(?:\d+[.)]\s)/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
}

/**
 * Estimates complexity based on keyword presence in the description.
 */
export function estimateComplexity(description: string): ComplexityEstimate {
  const lower = description.toLowerCase()

  // Check from highest to lowest complexity
  const levels: ComplexityEstimate[] = ["very-high", "high", "medium", "low", "trivial"]
  for (const level of levels) {
    if (COMPLEXITY_KEYWORDS[level].some((kw) => lower.includes(kw))) {
      return level
    }
  }
  return "medium" // Default if no keywords match
}

/**
 * Extracts significant keywords from a text description.
 * Filters out common stop words and returns unique keywords.
 */
export function extractKeywords(text: string): string[] {
  const stopWords = new Set([
    "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "do", "does", "did", "will", "would", "could",
    "should", "may", "might", "shall", "can", "need", "must", "to", "of",
    "in", "for", "on", "with", "at", "by", "from", "as", "into", "through",
    "during", "before", "after", "above", "below", "between", "and", "or",
    "but", "not", "no", "nor", "so", "yet", "both", "each", "all", "any",
    "few", "more", "most", "other", "some", "such", "than", "too", "very",
    "just", "also", "that", "this", "it", "its", "i", "we", "they", "them",
    "my", "our", "your", "their", "what", "which", "who", "when", "where",
    "how", "if", "then", "else", "up", "out", "about",
  ])

  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w))

  return [...new Set(words)]
}

/**
 * Detects whether a clause contains hedging language (indicating implicit intent).
 */
export function containsHedging(text: string): boolean {
  const lower = text.toLowerCase()
  return HEDGING_PATTERNS.some((pattern) => lower.includes(pattern))
}

/**
 * Computes confidence score for an intent based on specificity.
 * More keywords and clearer language = higher confidence.
 */
export function computeConfidence(description: string, layer: IntentLayer): number {
  const keywords = extractKeywords(description)
  const wordCount = description.split(/\s+/).length

  // Base confidence by layer: primary > secondary > implicit
  let base: number
  switch (layer) {
    case "primary":
      base = 0.8
      break
    case "secondary":
      base = 0.6
      break
    case "implicit":
      base = 0.4
      break
  }

  // Specificity bonus: more keywords = higher confidence (up to +0.15)
  const specificityBonus = Math.min(0.15, keywords.length * 0.02)

  // Length bonus: moderate length = higher confidence (too short or too long = less confident)
  const lengthFactor = wordCount >= 3 && wordCount <= 20 ? 0.05 : 0

  return Math.min(1.0, base + specificityBonus + lengthFactor)
}

/**
 * Creates an Intent object from a clause and layer classification.
 */
export function createIntent(description: string, layer: IntentLayer): Intent {
  return {
    id: generateIntentId(),
    layer,
    description: description.trim(),
    confidence: computeConfidence(description, layer),
    keywords: extractKeywords(description),
    complexity: estimateComplexity(description),
  }
}

/**
 * IntentExtractor — Extracts layered intents from a natural language prompt.
 *
 * Strategy:
 * - Primary: First clause and any imperative/direct statements
 * - Secondary: Requirements implied by primary intents (e.g., "create API" implies "setup routing")
 * - Implicit: Clauses with hedging language (maybe, perhaps, ideally, etc.)
 */
export class IntentExtractor {
  /**
   * Extract all three layers of intents from a prompt.
   */
  extract(prompt: string): { primary: Intent[]; secondary: Intent[]; implicit: Intent[] } {
    const clauses = splitIntoClauses(prompt)

    const primary: Intent[] = []
    const secondary: Intent[] = []
    const implicit: Intent[] = []

    for (let i = 0; i < clauses.length; i++) {
      const clause = clauses[i]

      if (containsHedging(clause)) {
        // Hedging language → implicit intent
        implicit.push(createIntent(clause, "implicit"))
      } else if (i === 0 || this.isDirectStatement(clause)) {
        // First clause or direct imperative → primary intent
        primary.push(createIntent(clause, "primary"))
      } else {
        // Supporting clauses → secondary intent
        secondary.push(createIntent(clause, "secondary"))
      }
    }

    // Ensure at least one primary intent (use full prompt if no clauses extracted)
    if (primary.length === 0 && clauses.length > 0) {
      primary.push(createIntent(prompt, "primary"))
    }

    // Derive secondary intents from primary intents
    const derived = this.deriveSecondaryIntents(primary)
    secondary.push(...derived)

    return { primary, secondary, implicit }
  }

  /**
   * Checks if a clause is a direct/imperative statement.
   */
  private isDirectStatement(clause: string): boolean {
    const imperativeVerbs = [
      "create", "build", "implement", "add", "remove", "fix", "update",
      "deploy", "configure", "setup", "install", "migrate", "refactor",
      "design", "test", "write", "delete", "move", "rename",
    ]
    const lower = clause.toLowerCase().trim()
    return imperativeVerbs.some((verb) => lower.startsWith(verb) || lower.includes(`need to ${verb}`))
  }

  /**
   * Derives implied secondary intents from primary intents.
   * For example, "create API endpoint" implies "setup routing".
   */
  private deriveSecondaryIntents(primaryIntents: Intent[]): Intent[] {
    const derived: Intent[] = []
    const derivationRules: Array<{ trigger: string; implies: string }> = [
      { trigger: "api", implies: "Setup request validation and error handling" },
      { trigger: "database", implies: "Configure database connection and migrations" },
      { trigger: "auth", implies: "Implement security measures and token management" },
      { trigger: "deploy", implies: "Configure deployment environment and CI/CD pipeline" },
      { trigger: "test", implies: "Setup test framework and fixtures" },
      { trigger: "ui", implies: "Ensure responsive layout and accessibility" },
      { trigger: "endpoint", implies: "Define request/response schemas" },
    ]

    for (const intent of primaryIntents) {
      const lower = intent.description.toLowerCase()
      for (const rule of derivationRules) {
        if (lower.includes(rule.trigger)) {
          derived.push(createIntent(rule.implies, "secondary"))
        }
      }
    }

    return derived
  }
}
