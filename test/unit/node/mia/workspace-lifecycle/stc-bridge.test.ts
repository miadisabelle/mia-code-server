import {
  createChartFromSpec,
  computeTensionLevel,
  isAdvancingPattern,
} from "../../../../../src/node/mia/workspace-lifecycle/stc-bridge"
import { Workspace } from "../../../../../src/node/mia/workspace-lifecycle/types"

function makeWorkspace(overrides: Partial<Workspace> = {}): Workspace {
  const now = new Date().toISOString()
  return {
    id: "test-ws",
    title: "Test",
    createdAt: now,
    updatedAt: now,
    status: "germinating",
    phase: "task",
    task: {
      description: "Test",
      source: "natural-language",
      creativeIntent: "Test",
      edits: [],
    },
    codeChanges: [],
    narrativeArc: {
      creativePhase: "germination",
      beats: [],
      tensionLevel: 1.0,
      advancingPattern: true,
    },
    versionHistory: [],
    ...overrides,
  }
}

describe("STC Bridge", () => {
  describe("createChartFromSpec", () => {
    it("should return null when no spec", () => {
      const ws = makeWorkspace()
      expect(createChartFromSpec(ws)).toBeNull()
    })

    it("should create chart from spec", () => {
      const ws = makeWorkspace({
        spec: {
          id: "spec-1",
          version: 1,
          currentReality: [
            { id: "cr1", text: "No auth exists", order: 0, addedBy: "ai" },
          ],
          desiredOutcome: [
            { id: "do1", text: "JWT auth working", order: 0, addedBy: "ai" },
          ],
          generatedAt: new Date().toISOString(),
          editHistory: [],
        },
      })

      const chart = createChartFromSpec(ws)
      expect(chart).not.toBeNull()
      expect(chart!.outcome).toContain("JWT auth working")
      expect(chart!.reality).toContain("No auth exists")
      expect(chart!.id).toBeTruthy()
    })

    it("should include plan actions in chart", () => {
      const ws = makeWorkspace({
        spec: {
          id: "spec-1",
          version: 1,
          currentReality: [{ id: "cr1", text: "R", order: 0, addedBy: "ai" }],
          desiredOutcome: [{ id: "do1", text: "O", order: 0, addedBy: "ai" }],
          generatedAt: new Date().toISOString(),
          editHistory: [],
        },
        plan: {
          id: "plan-1",
          version: 1,
          files: [
            {
              id: "f1",
              path: "src/auth.ts",
              operation: "create",
              actions: [
                { id: "a1", description: "Create JWT module", order: 0, completed: false, addedBy: "ai" },
                { id: "a2", description: "Add validation", order: 1, completed: true, addedBy: "ai" },
              ],
              order: 0,
              dependencies: [],
            },
          ],
          generatedAt: new Date().toISOString(),
          editHistory: [],
        },
      })

      const chart = createChartFromSpec(ws)
      expect(chart!.actions).toHaveLength(2)
      expect(chart!.actions[0].title).toContain("src/auth.ts")
      expect(chart!.actions[1].completed).toBe(true)
    })
  })

  describe("computeTensionLevel", () => {
    it("should be 1.0 for fresh workspace", () => {
      const ws = makeWorkspace()
      expect(computeTensionLevel(ws)).toBe(1.0)
    })

    it("should decrease with spec", () => {
      const ws = makeWorkspace({
        spec: {
          id: "s",
          version: 1,
          currentReality: [{ id: "1", text: "R", order: 0, addedBy: "ai" }],
          desiredOutcome: [{ id: "2", text: "O", order: 0, addedBy: "ai" }],
          generatedAt: new Date().toISOString(),
          editHistory: [],
        },
      })
      expect(computeTensionLevel(ws)).toBeLessThan(1.0)
    })

    it("should decrease further with plan and completed actions", () => {
      const ws = makeWorkspace({
        spec: {
          id: "s",
          version: 1,
          currentReality: [{ id: "1", text: "R", order: 0, addedBy: "ai" }],
          desiredOutcome: [{ id: "2", text: "O", order: 0, addedBy: "ai" }],
          generatedAt: new Date().toISOString(),
          editHistory: [],
        },
        plan: {
          id: "p",
          version: 1,
          files: [
            {
              id: "f",
              path: "x.ts",
              operation: "create",
              actions: [
                { id: "a1", description: "Do thing", order: 0, completed: true, addedBy: "ai" },
                { id: "a2", description: "Do other", order: 1, completed: true, addedBy: "ai" },
              ],
              order: 0,
              dependencies: [],
            },
          ],
          generatedAt: new Date().toISOString(),
          editHistory: [],
        },
      })
      const tension = computeTensionLevel(ws)
      expect(tension).toBeLessThan(0.5)
    })

    it("should be 0 for completed workspace", () => {
      const ws = makeWorkspace({ phase: "complete" })
      expect(computeTensionLevel(ws)).toBe(0)
    })
  })

  describe("isAdvancingPattern", () => {
    it("should return true for too few beats", () => {
      const ws = makeWorkspace()
      ws.narrativeArc.beats = [
        { timestamp: "", phase: "task", event: "e", narrativeText: "t" },
      ]
      expect(isAdvancingPattern(ws)).toBe(true)
    })

    it("should return true for forward progression", () => {
      const ws = makeWorkspace()
      ws.narrativeArc.beats = [
        { timestamp: "", phase: "task", event: "e", narrativeText: "t" },
        { timestamp: "", phase: "spec", event: "e", narrativeText: "t" },
        { timestamp: "", phase: "plan", event: "e", narrativeText: "t" },
        { timestamp: "", phase: "code", event: "e", narrativeText: "t" },
      ]
      expect(isAdvancingPattern(ws)).toBe(true)
    })

    it("should return false for heavy oscillation", () => {
      const ws = makeWorkspace()
      ws.narrativeArc.beats = [
        { timestamp: "", phase: "plan", event: "e", narrativeText: "t" },
        { timestamp: "", phase: "spec", event: "e", narrativeText: "t" },
        { timestamp: "", phase: "plan", event: "e", narrativeText: "t" },
        { timestamp: "", phase: "spec", event: "e", narrativeText: "t" },
        { timestamp: "", phase: "plan", event: "e", narrativeText: "t" },
      ]
      expect(isAdvancingPattern(ws)).toBe(false)
    })
  })
})
