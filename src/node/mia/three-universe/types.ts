/**
 * Three-Universe Types
 *
 * Core data structures for the three-universe analysis system.
 * Every input passes through three interpretive lenses:
 * - Engineer: technical precision, code quality, architecture
 * - Ceremony: relational accountability, impact, sacred pause
 * - Story: narrative coherence, arc, character consistency
 *
 * The synthesis combines all three into a balanced perspective.
 */

// --- Universe Identity ---

export type UniverseName = "engineer" | "ceremony" | "story"

export type AnalysisDepth = "quick" | "standard" | "deep"

// --- Lens Interface ---

export interface LensInput {
  text: string
  context: Record<string, unknown>
  depth: AnalysisDepth
}

export interface LensOutput {
  universe: UniverseName
  assessment: string
  score: number // 0-1
  details: Record<string, unknown>
  suggestions?: string[]
}

export interface UniverseLens {
  universe: UniverseName
  name: string
  analyze(input: LensInput): Promise<LensOutput>
}

// --- Dispatcher Types ---

export interface UniverseInput {
  text: string
  context: {
    file?: string
    language?: string
    workspace?: string
    session?: string
    previousBeats?: Array<{ timestamp: string; event: string }>
    activeCharts?: Array<{ id: string; outcome: string }>
  }
  universes: UniverseName[]
  options?: {
    timeout?: number
    depth?: AnalysisDepth
  }
}

export interface UniverseOutput {
  engineer?: LensOutput
  ceremony?: LensOutput
  story?: LensOutput
  synthesis: Synthesis
  traceId: string
  timing: {
    total: number
    perUniverse: Record<string, number>
  }
}

// --- Synthesis ---

export interface TensionPoint {
  between: [UniverseName, UniverseName]
  description: string
  severity: "low" | "medium" | "high"
}

export interface Agreement {
  universes: UniverseName[]
  description: string
}

export interface Synthesis {
  narrative: string
  coherenceScore: number // 0-1
  tensions: TensionPoint[]
  agreements: Agreement[]
  dominantUniverse: UniverseName | null
  recommendation: string
}

// --- Weight Configuration ---

export interface UniverseWeights {
  engineer: number
  ceremony: number
  story: number
}

export const DEFAULT_WEIGHTS: UniverseWeights = {
  engineer: 0.4,
  ceremony: 0.3,
  story: 0.3,
}

// --- Cache ---

export interface CachedAnalysis {
  inputHash: string
  output: UniverseOutput
  cachedAt: number
  ttlMs: number
}
