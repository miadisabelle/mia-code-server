import { CoherenceSynthesizer } from "../../../../../src/node/mia/three-universe/coherence-synthesizer"
import { LensOutput, UniverseName } from "../../../../../src/node/mia/three-universe/types"

function makeLensOutput(universe: UniverseName, score: number, assessment?: string): LensOutput {
  return {
    universe,
    assessment: assessment ?? `Assessment for ${universe}`,
    score,
    details: {},
    suggestions: [],
  }
}

describe("CoherenceSynthesizer", () => {
  let synthesizer: CoherenceSynthesizer

  beforeEach(() => {
    synthesizer = new CoherenceSynthesizer()
  })

  it("should produce a synthesis from three lens outputs", () => {
    const outputs = [
      makeLensOutput("engineer", 0.8),
      makeLensOutput("ceremony", 0.7),
      makeLensOutput("story", 0.75),
    ]

    const synthesis = synthesizer.synthesize(outputs)

    expect(synthesis.coherenceScore).toBeGreaterThan(0)
    expect(synthesis.coherenceScore).toBeLessThanOrEqual(1)
    expect(synthesis.narrative).toBeTruthy()
    expect(synthesis.recommendation).toBeTruthy()
  })

  it("should detect tensions between divergent scores", () => {
    const outputs = [
      makeLensOutput("engineer", 0.9),
      makeLensOutput("ceremony", 0.3),
      makeLensOutput("story", 0.7),
    ]

    const synthesis = synthesizer.synthesize(outputs)

    expect(synthesis.tensions.length).toBeGreaterThan(0)
    const tension = synthesis.tensions.find(
      (t) => t.between.includes("engineer") && t.between.includes("ceremony"),
    )
    expect(tension).toBeDefined()
    expect(tension!.severity).toBe("high")
  })

  it("should detect agreements between similar scores", () => {
    const outputs = [
      makeLensOutput("engineer", 0.7),
      makeLensOutput("ceremony", 0.72),
      makeLensOutput("story", 0.71),
    ]

    const synthesis = synthesizer.synthesize(outputs)

    expect(synthesis.agreements.length).toBeGreaterThan(0)
  })

  it("should identify dominant universe when one clearly leads", () => {
    const outputs = [
      makeLensOutput("engineer", 0.95),
      makeLensOutput("ceremony", 0.4),
      makeLensOutput("story", 0.5),
    ]

    const synthesis = synthesizer.synthesize(outputs)
    expect(synthesis.dominantUniverse).toBe("engineer")
  })

  it("should return null dominant when scores are balanced", () => {
    const outputs = [
      makeLensOutput("engineer", 0.7),
      makeLensOutput("ceremony", 0.7),
      makeLensOutput("story", 0.7),
    ]

    const synthesis = synthesizer.synthesize(outputs)
    expect(synthesis.dominantUniverse).toBeNull()
  })

  it("should handle single universe input", () => {
    const outputs = [makeLensOutput("engineer", 0.8)]

    const synthesis = synthesizer.synthesize(outputs)
    expect(synthesis.coherenceScore).toBeGreaterThan(0)
    expect(synthesis.tensions).toHaveLength(0)
  })

  it("should handle empty input gracefully", () => {
    const synthesis = synthesizer.synthesize([])
    expect(synthesis.coherenceScore).toBe(0)
    expect(synthesis.narrative).toBeTruthy()
    expect(synthesis.recommendation).toBeTruthy()
  })

  it("should support custom weights", () => {
    const customSynthesizer = new CoherenceSynthesizer({
      engineer: 0.6,
      ceremony: 0.2,
      story: 0.2,
    })

    const outputs = [
      makeLensOutput("engineer", 0.9),
      makeLensOutput("ceremony", 0.3),
      makeLensOutput("story", 0.3),
    ]

    const defaultSynthesis = synthesizer.synthesize(outputs)
    const customSynthesis = customSynthesizer.synthesize(outputs)

    // Custom synthesis should weight engineer higher
    expect(customSynthesis.coherenceScore).not.toBe(defaultSynthesis.coherenceScore)
  })
})
