import { UniverseDispatcher } from "../../../../../src/node/mia/three-universe/universe-dispatcher"
import { EngineerLens } from "../../../../../src/node/mia/three-universe/lenses/engineer-lens"
import { CeremonyLens } from "../../../../../src/node/mia/three-universe/lenses/ceremony-lens"
import { StoryLens } from "../../../../../src/node/mia/three-universe/lenses/story-lens"
import { UniverseInput, UniverseLens } from "../../../../../src/node/mia/three-universe/types"

function makeInput(text: string, universes?: ("engineer" | "ceremony" | "story")[]): UniverseInput {
  return {
    text,
    context: {},
    universes: universes ?? ["engineer", "ceremony", "story"],
  }
}

describe("UniverseDispatcher", () => {
  let dispatcher: UniverseDispatcher

  beforeEach(() => {
    dispatcher = new UniverseDispatcher([
      new EngineerLens(),
      new CeremonyLens(),
      new StoryLens(),
    ])
  })

  it("should dispatch to all three universes", async () => {
    const input = makeInput("Implement a type-safe API with team review and narrative arc")
    const output = await dispatcher.dispatch(input)

    expect(output.engineer).toBeDefined()
    expect(output.ceremony).toBeDefined()
    expect(output.story).toBeDefined()
    expect(output.synthesis).toBeDefined()
    expect(output.traceId).toBeTruthy()
    expect(output.timing.total).toBeGreaterThanOrEqual(0)
  })

  it("should support universe subset selection", async () => {
    const input = makeInput("Build a modular service", ["engineer", "story"])
    const output = await dispatcher.dispatch(input)

    expect(output.engineer).toBeDefined()
    expect(output.story).toBeDefined()
    expect(output.ceremony).toBeUndefined()
  })

  it("should produce a synthesis with coherence score", async () => {
    const input = makeInput("Create a clean, type-safe module with team collaboration")
    const output = await dispatcher.dispatch(input)

    expect(output.synthesis.coherenceScore).toBeGreaterThanOrEqual(0)
    expect(output.synthesis.coherenceScore).toBeLessThanOrEqual(1)
    expect(output.synthesis.narrative).toBeTruthy()
  })

  it("should track per-universe timing", async () => {
    const input = makeInput("Analyze this code")
    const output = await dispatcher.dispatch(input)

    expect(output.timing.perUniverse).toBeDefined()
    expect(typeof output.timing.perUniverse["engineer"]).toBe("number")
    expect(typeof output.timing.perUniverse["ceremony"]).toBe("number")
    expect(typeof output.timing.perUniverse["story"]).toBe("number")
  })

  it("should cache repeated identical requests", async () => {
    const input = makeInput("Type-safe implementation with interface patterns")

    const first = await dispatcher.dispatch(input)
    const second = await dispatcher.dispatch(input)

    // Same synthesis (from cache) — second call should be faster
    expect(second.synthesis.coherenceScore).toBe(first.synthesis.coherenceScore)
  })

  it("should handle timeout gracefully", async () => {
    // Create a lens that takes forever
    const slowLens: UniverseLens = {
      universe: "engineer",
      name: "Slow Engineer",
      analyze: () => new Promise((resolve) => setTimeout(() => resolve({
        universe: "engineer",
        assessment: "slow",
        score: 0.5,
        details: {},
      }), 5000)),
    }

    const slowDispatcher = new UniverseDispatcher(
      [slowLens, new CeremonyLens(), new StoryLens()],
    )

    const input: UniverseInput = {
      text: "Quick analysis",
      context: {},
      universes: ["engineer", "ceremony", "story"],
      options: { timeout: 50 }, // Very short timeout
    }

    const output = await slowDispatcher.dispatch(input)

    // Engineer should have timed out, but ceremony and story should succeed
    expect(output.ceremony).toBeDefined()
    expect(output.story).toBeDefined()
  })

  it("should report registered universes", () => {
    const registered = dispatcher.getRegisteredUniverses()
    expect(registered).toContain("engineer")
    expect(registered).toContain("ceremony")
    expect(registered).toContain("story")
  })

  it("should clear cache", async () => {
    const input = makeInput("Test input")
    await dispatcher.dispatch(input)

    dispatcher.clearCache()

    // After clearing, next call should re-compute
    const output = await dispatcher.dispatch(input)
    expect(output.synthesis).toBeDefined()
  })
})

describe("Default Lenses", () => {
  describe("EngineerLens", () => {
    const lens = new EngineerLens()

    it("should score higher for technically strong text", async () => {
      const result = await lens.analyze({
        text: "This type-safe interface uses the strategy pattern with clean modular design",
        context: {},
        depth: "standard",
      })
      expect(result.score).toBeGreaterThan(0.5)
      expect(result.universe).toBe("engineer")
    })

    it("should score lower for risky text", async () => {
      const result = await lens.analyze({
        text: "This is a hack workaround using any types as a temporary fix",
        context: {},
        depth: "standard",
      })
      expect(result.score).toBeLessThan(0.5)
    })
  })

  describe("CeremonyLens", () => {
    const lens = new CeremonyLens()

    it("should score higher for relational text", async () => {
      const result = await lens.analyze({
        text: "Let's collaborate on this review as a team and celebrate the release",
        context: {},
        depth: "standard",
      })
      expect(result.score).toBeGreaterThan(0.5)
      expect(result.universe).toBe("ceremony")
    })
  })

  describe("StoryLens", () => {
    const lens = new StoryLens()

    it("should score higher for narratively rich text", async () => {
      const result = await lens.analyze({
        text: "The story arc progresses from setup through conflict to resolution with thematic consistency",
        context: {},
        depth: "standard",
      })
      expect(result.score).toBeGreaterThan(0.5)
      expect(result.universe).toBe("story")
    })
  })
})
