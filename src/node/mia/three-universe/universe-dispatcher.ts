/**
 * UniverseDispatcher — Routes input to three parallel analysis paths
 *
 * Core orchestrator for the three-universe analysis system.
 * Dispatches input to configured universe lenses in parallel,
 * collects results with timeout handling, and passes them
 * to the CoherenceSynthesizer for unified output.
 *
 * Supports:
 * - Universe subset selection (e.g., only engineer + story)
 * - Per-universe timeout with graceful degradation
 * - Result caching by input hash
 */

import * as crypto from "crypto"
import {
  UniverseName,
  UniverseLens,
  UniverseInput,
  UniverseOutput,
  LensInput,
  LensOutput,
  CachedAnalysis,
} from "./types"
import { CoherenceSynthesizer } from "./coherence-synthesizer"

/** Default timeout per lens: 30 seconds */
const DEFAULT_TIMEOUT_MS = 30_000

/** Cache TTL: 5 minutes */
const CACHE_TTL_MS = 5 * 60 * 1000

export class UniverseDispatcher {
  private readonly lenses: Map<UniverseName, UniverseLens>
  private readonly synthesizer: CoherenceSynthesizer
  private readonly cache: Map<string, CachedAnalysis>

  constructor(
    lenses: UniverseLens[],
    synthesizer?: CoherenceSynthesizer,
  ) {
    this.lenses = new Map()
    for (const lens of lenses) {
      this.lenses.set(lens.universe, lens)
    }
    this.synthesizer = synthesizer ?? new CoherenceSynthesizer()
    this.cache = new Map()
  }

  /**
   * Dispatch input through selected universe lenses in parallel.
   */
  async dispatch(input: UniverseInput): Promise<UniverseOutput> {
    const startTime = Date.now()
    const traceId = crypto.randomUUID()

    // Check cache
    const cacheKey = this.computeCacheKey(input)
    const cached = this.getFromCache(cacheKey)
    if (cached) {
      return { ...cached, traceId }
    }

    const timeout = input.options?.timeout ?? DEFAULT_TIMEOUT_MS
    const depth = input.options?.depth ?? "standard"

    // Select lenses to dispatch to
    const selectedUniverses = input.universes.length > 0
      ? input.universes
      : (Array.from(this.lenses.keys()) as UniverseName[])

    // Build lens input
    const lensInput: LensInput = {
      text: input.text,
      context: input.context as Record<string, unknown>,
      depth,
    }

    // Dispatch in parallel with timeout
    const results = await this.dispatchParallel(selectedUniverses, lensInput, timeout)

    // Collect timing
    const perUniverse: Record<string, number> = {}
    const outputs: LensOutput[] = []

    for (const [universe, result] of results) {
      if (result.success) {
        outputs.push(result.output!)
        perUniverse[universe] = result.durationMs
      } else {
        perUniverse[universe] = result.durationMs
        // Graceful degradation: log failure but continue
      }
    }

    // Synthesize
    const synthesis = this.synthesizer.synthesize(outputs)
    const totalTime = Date.now() - startTime

    const output: UniverseOutput = {
      engineer: outputs.find((o) => o.universe === "engineer"),
      ceremony: outputs.find((o) => o.universe === "ceremony"),
      story: outputs.find((o) => o.universe === "story"),
      synthesis,
      traceId,
      timing: { total: totalTime, perUniverse },
    }

    // Cache result
    this.setCache(cacheKey, output)

    return output
  }

  /**
   * Get the list of registered universe lenses.
   */
  getRegisteredUniverses(): UniverseName[] {
    return Array.from(this.lenses.keys())
  }

  /**
   * Clear the analysis cache.
   */
  clearCache(): void {
    this.cache.clear()
  }

  // --- Private methods ---

  private async dispatchParallel(
    universes: UniverseName[],
    input: LensInput,
    timeoutMs: number,
  ): Promise<Map<UniverseName, LensResult>> {
    const promises = universes.map(async (universe) => {
      const lens = this.lenses.get(universe)
      if (!lens) {
        return [universe, {
          success: false,
          durationMs: 0,
          error: `No lens registered for universe: ${universe}`,
        }] as [UniverseName, LensResult]
      }

      const start = Date.now()
      try {
        const output = await this.withTimeout(lens.analyze(input), timeoutMs)
        return [universe, {
          success: true,
          output,
          durationMs: Date.now() - start,
        }] as [UniverseName, LensResult]
      } catch (error) {
        return [universe, {
          success: false,
          durationMs: Date.now() - start,
          error: error instanceof Error ? error.message : String(error),
        }] as [UniverseName, LensResult]
      }
    })

    const results = await Promise.allSettled(promises)
    const resultMap = new Map<UniverseName, LensResult>()

    for (const result of results) {
      if (result.status === "fulfilled") {
        const [universe, lensResult] = result.value
        resultMap.set(universe, lensResult)
      }
    }

    return resultMap
  }

  private async withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs),
      ),
    ])
  }

  private computeCacheKey(input: UniverseInput): string {
    const hashInput = JSON.stringify({
      text: input.text,
      universes: input.universes.sort(),
      depth: input.options?.depth ?? "standard",
    })
    return crypto.createHash("sha256").update(hashInput).digest("hex")
  }

  private getFromCache(key: string): UniverseOutput | null {
    const cached = this.cache.get(key)
    if (!cached) return null

    const age = Date.now() - cached.cachedAt
    if (age > cached.ttlMs) {
      this.cache.delete(key)
      return null
    }

    return cached.output
  }

  private setCache(key: string, output: UniverseOutput): void {
    this.cache.set(key, {
      inputHash: key,
      output,
      cachedAt: Date.now(),
      ttlMs: CACHE_TTL_MS,
    })
  }
}

interface LensResult {
  success: boolean
  output?: LensOutput
  durationMs: number
  error?: string
}
