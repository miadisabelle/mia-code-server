import { DirectionAnalyzer, computeDirectionScore, classifyDirection, emptyFourDirections } from "../../../../../src/node/mia/pde-engine/direction-analyzer"
import { Intent } from "../../../../../src/node/mia/pde-engine/types"

function makeIntent(description: string, layer: "primary" | "secondary" | "implicit" = "primary"): Intent {
  return {
    id: `intent-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    layer,
    description,
    confidence: 0.8,
    keywords: description.toLowerCase().split(/\s+/),
    complexity: "medium",
  }
}

describe("DirectionAnalyzer utilities", () => {
  describe("computeDirectionScore", () => {
    it("should score north for strategy keywords", () => {
      expect(computeDirectionScore("plan the architecture strategy", "north")).toBeGreaterThan(0)
    })

    it("should score east for creation keywords", () => {
      expect(computeDirectionScore("create a new prototype", "east")).toBeGreaterThan(0)
    })

    it("should score south for trust/testing keywords", () => {
      expect(computeDirectionScore("test and validate quality", "south")).toBeGreaterThan(0)
    })

    it("should score west for reflection keywords", () => {
      expect(computeDirectionScore("refactor and simplify the code", "west")).toBeGreaterThan(0)
    })

    it("should return 0 for no keyword matches", () => {
      expect(computeDirectionScore("hello world", "north")).toBe(0)
    })

    it("should cap at 1.0", () => {
      // Use many north keywords
      const score = computeDirectionScore(
        "strategy vision architecture design plan roadmap goal objective",
        "north",
      )
      expect(score).toBeLessThanOrEqual(1.0)
    })
  })

  describe("classifyDirection", () => {
    it("should classify strategy text as north", () => {
      expect(classifyDirection("design the system architecture")).toBe("north")
    })

    it("should classify creation text as east", () => {
      expect(classifyDirection("create a new dashboard prototype")).toBe("east")
    })

    it("should classify testing text as south", () => {
      expect(classifyDirection("test the application and review quality")).toBe("south")
    })

    it("should classify refactoring as west", () => {
      expect(classifyDirection("refactor and simplify the module")).toBe("west")
    })

    it("should default to east for ambiguous text", () => {
      expect(classifyDirection("do something generic")).toBe("east")
    })
  })

  describe("emptyFourDirections", () => {
    it("should create an empty structure", () => {
      const dirs = emptyFourDirections()
      expect(dirs.north.intents).toHaveLength(0)
      expect(dirs.east.intents).toHaveLength(0)
      expect(dirs.south.intents).toHaveLength(0)
      expect(dirs.west.intents).toHaveLength(0)
      expect(dirs.north.energy_level).toBe(0)
    })
  })
})

describe("DirectionAnalyzer", () => {
  let analyzer: DirectionAnalyzer

  beforeEach(() => {
    analyzer = new DirectionAnalyzer()
  })

  describe("analyze", () => {
    it("should classify intents into directions", () => {
      const intents = [
        makeIntent("design the system architecture"),
        makeIntent("create a new user service"),
        makeIntent("test the integration points"),
        makeIntent("refactor the legacy code"),
      ]

      const result = analyzer.analyze(intents)

      expect(result.north.intents.length).toBeGreaterThanOrEqual(1)
      expect(result.east.intents.length).toBeGreaterThanOrEqual(1)
      expect(result.south.intents.length).toBeGreaterThanOrEqual(1)
      expect(result.west.intents.length).toBeGreaterThanOrEqual(1)
    })

    it("should compute energy levels proportional to intent count", () => {
      const intents = [
        makeIntent("create service A"),
        makeIntent("build service B"),
        makeIntent("launch new feature"),
        makeIntent("test something"),
      ]

      const result = analyzer.analyze(intents)

      // Most intents should map to east (create/build/launch)
      expect(result.east.energy_level).toBeGreaterThan(0)

      // Total energy levels should approximately sum to 1
      const total =
        result.north.energy_level +
        result.east.energy_level +
        result.south.energy_level +
        result.west.energy_level
      expect(total).toBeCloseTo(1.0, 1)
    })

    it("should handle empty intents", () => {
      const result = analyzer.analyze([])
      expect(result.north.energy_level).toBe(0)
      expect(result.east.energy_level).toBe(0)
      expect(result.south.energy_level).toBe(0)
      expect(result.west.energy_level).toBe(0)
    })

    it("should add balance notes", () => {
      const result = analyzer.analyze([makeIntent("create something new")])
      // All directions should have balance notes
      expect(result.north.balance_note).toBeTruthy()
      expect(result.east.balance_note).toBeTruthy()
      expect(result.south.balance_note).toBeTruthy()
      expect(result.west.balance_note).toBeTruthy()
    })

    it("should detect dominant direction", () => {
      const intents = [
        makeIntent("create a new service"),
        makeIntent("build a new dashboard"),
        makeIntent("launch new features"),
        makeIntent("explore new ideas"),
      ]

      const result = analyzer.analyze(intents)
      // East should dominate
      expect(result.east.energy_level).toBeGreaterThanOrEqual(0.5)
      expect(result.east.balance_note).toContain("dominant")
    })
  })
})
