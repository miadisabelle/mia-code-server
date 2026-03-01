import { BalanceAdvisor } from "../../../../../src/node/mia/pde-engine/balance-advisor"
import { FourDirections } from "../../../../../src/node/mia/pde-engine/types"
import { emptyFourDirections } from "../../../../../src/node/mia/pde-engine/direction-analyzer"

function makeDirections(overrides: Partial<FourDirections> = {}): FourDirections {
  return {
    ...emptyFourDirections(),
    ...overrides,
  }
}

describe("BalanceAdvisor", () => {
  let advisor: BalanceAdvisor

  beforeEach(() => {
    advisor = new BalanceAdvisor()
  })

  describe("assess", () => {
    it("should report balanced when energy is well-distributed", () => {
      const directions = makeDirections({
        north: { intents: ["plan"], energy_level: 0.25, balance_note: "" },
        east: { intents: ["create"], energy_level: 0.25, balance_note: "" },
        south: { intents: ["test"], energy_level: 0.25, balance_note: "" },
        west: { intents: ["refactor"], energy_level: 0.25, balance_note: "" },
      })

      const report = advisor.assess(directions)
      expect(report.isBalanced).toBe(true)
      expect(report.recommendations).toHaveLength(0)
      expect(report.overallHealth).toBeCloseTo(1.0, 1)
    })

    it("should detect overweight direction", () => {
      const directions = makeDirections({
        north: { intents: [], energy_level: 0, balance_note: "" },
        east: { intents: ["a", "b", "c", "d"], energy_level: 0.8, balance_note: "" },
        south: { intents: [], energy_level: 0.1, balance_note: "" },
        west: { intents: [], energy_level: 0.1, balance_note: "" },
      })

      const report = advisor.assess(directions)
      expect(report.isBalanced).toBe(false)
      expect(report.dominantDirection).toBe("east")
      expect(report.recommendations.some((r) => r.direction === "east" && r.issue === "overweight")).toBe(true)
    })

    it("should detect absent directions", () => {
      const directions = makeDirections({
        north: { intents: [], energy_level: 0, balance_note: "" },
        east: { intents: ["create"], energy_level: 0.5, balance_note: "" },
        south: { intents: ["test"], energy_level: 0.5, balance_note: "" },
        west: { intents: [], energy_level: 0, balance_note: "" },
      })

      const report = advisor.assess(directions)
      expect(report.isBalanced).toBe(false)
      expect(report.recommendations.some((r) => r.direction === "north" && r.issue === "absent")).toBe(true)
      expect(report.recommendations.some((r) => r.direction === "west" && r.issue === "absent")).toBe(true)
    })

    it("should identify dominant and weakest directions", () => {
      const directions = makeDirections({
        north: { intents: ["strategy", "vision", "plan"], energy_level: 0.6, balance_note: "" },
        east: { intents: ["create"], energy_level: 0.2, balance_note: "" },
        south: { intents: ["test"], energy_level: 0.15, balance_note: "" },
        west: { intents: [], energy_level: 0.05, balance_note: "" },
      })

      const report = advisor.assess(directions)
      expect(report.dominantDirection).toBe("north")
      expect(report.weakestDirection).toBe("west")
    })

    it("should provide actionable suggestions", () => {
      const directions = makeDirections({
        north: { intents: [], energy_level: 0, balance_note: "" },
        east: { intents: ["create"], energy_level: 1.0, balance_note: "" },
        south: { intents: [], energy_level: 0, balance_note: "" },
        west: { intents: [], energy_level: 0, balance_note: "" },
      })

      const report = advisor.assess(directions)
      expect(report.recommendations.length).toBeGreaterThan(0)
      for (const rec of report.recommendations) {
        expect(rec.suggestion.length).toBeGreaterThan(10)
      }
    })

    it("should compute overall health between 0 and 1", () => {
      // Perfectly balanced
      const balanced = makeDirections({
        north: { intents: ["a"], energy_level: 0.25, balance_note: "" },
        east: { intents: ["b"], energy_level: 0.25, balance_note: "" },
        south: { intents: ["c"], energy_level: 0.25, balance_note: "" },
        west: { intents: ["d"], energy_level: 0.25, balance_note: "" },
      })
      const healthyReport = advisor.assess(balanced)
      expect(healthyReport.overallHealth).toBeCloseTo(1.0, 1)

      // Completely imbalanced
      const imbalanced = makeDirections({
        north: { intents: [], energy_level: 0, balance_note: "" },
        east: { intents: ["a", "b", "c", "d"], energy_level: 1.0, balance_note: "" },
        south: { intents: [], energy_level: 0, balance_note: "" },
        west: { intents: [], energy_level: 0, balance_note: "" },
      })
      const unhealthyReport = advisor.assess(imbalanced)
      expect(unhealthyReport.overallHealth).toBeLessThan(0.5)
    })

    it("should handle all-zero energy levels", () => {
      const empty = emptyFourDirections()
      const report = advisor.assess(empty)
      // All absent
      expect(report.recommendations).toHaveLength(4)
      expect(report.dominantDirection).toBeNull()
    })
  })
})
