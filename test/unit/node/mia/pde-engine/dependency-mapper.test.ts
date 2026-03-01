import { DependencyMapper } from "../../../../../src/node/mia/pde-engine/dependency-mapper"
import { Action } from "../../../../../src/node/mia/pde-engine/types"

function makeAction(overrides: Partial<Action> = {}): Action {
  return {
    id: `action-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    description: "Test action",
    intentId: "intent-1",
    status: "pending",
    order: 0,
    dependencies: [],
    estimatedEffort: "medium",
    ...overrides,
  }
}

describe("DependencyMapper", () => {
  let mapper: DependencyMapper

  beforeEach(() => {
    mapper = new DependencyMapper()
  })

  describe("inferDependencies", () => {
    it("should infer that test depends on create", () => {
      const actions = [
        makeAction({ id: "a1", description: "Create the user service" }),
        makeAction({ id: "a2", description: "Test the user service" }),
      ]

      const deps = mapper.inferDependencies(actions)
      expect(deps.length).toBeGreaterThanOrEqual(1)
      // Test should depend on create
      expect(deps.some((d) => d.fromActionId === "a2" && d.toActionId === "a1")).toBe(true)
    })

    it("should infer that deploy depends on build and test", () => {
      const actions = [
        makeAction({ id: "a1", description: "Build the application" }),
        makeAction({ id: "a2", description: "Test the application" }),
        makeAction({ id: "a3", description: "Deploy to production" }),
      ]

      const deps = mapper.inferDependencies(actions)
      // Deploy should depend on both build and test
      expect(deps.some((d) => d.fromActionId === "a3" && d.toActionId === "a1")).toBe(true)
      expect(deps.some((d) => d.fromActionId === "a3" && d.toActionId === "a2")).toBe(true)
    })

    it("should not create self-dependencies", () => {
      const actions = [makeAction({ id: "a1", description: "Create and test the feature" })]
      const deps = mapper.inferDependencies(actions)
      expect(deps.every((d) => d.fromActionId !== d.toActionId)).toBe(true)
    })

    it("should honor explicit dependencies", () => {
      const actions = [
        makeAction({ id: "a1", description: "Setup database" }),
        makeAction({ id: "a2", description: "Run migrations", dependencies: ["a1"] }),
      ]

      const deps = mapper.inferDependencies(actions)
      expect(deps.some((d) => d.fromActionId === "a2" && d.toActionId === "a1")).toBe(true)
    })

    it("should avoid duplicate dependencies", () => {
      const actions = [
        makeAction({ id: "a1", description: "Create the service" }),
        makeAction({ id: "a2", description: "Test the service", dependencies: ["a1"] }),
      ]

      const deps = mapper.inferDependencies(actions)
      const a2ToA1 = deps.filter((d) => d.fromActionId === "a2" && d.toActionId === "a1")
      expect(a2ToA1).toHaveLength(1)
    })
  })

  describe("detectCircularDependencies", () => {
    it("should detect no cycles in a linear chain", () => {
      const actions = [
        makeAction({ id: "a1", description: "Setup" }),
        makeAction({ id: "a2", description: "Build" }),
        makeAction({ id: "a3", description: "Deploy" }),
      ]
      const deps = [
        { id: "d1", fromActionId: "a2", toActionId: "a1", type: "requires" as const },
        { id: "d2", fromActionId: "a3", toActionId: "a2", type: "requires" as const },
      ]
      expect(mapper.detectCircularDependencies(actions, deps)).toBe(false)
    })

    it("should detect a cycle", () => {
      const actions = [
        makeAction({ id: "a1" }),
        makeAction({ id: "a2" }),
      ]
      const deps = [
        { id: "d1", fromActionId: "a1", toActionId: "a2", type: "requires" as const },
        { id: "d2", fromActionId: "a2", toActionId: "a1", type: "requires" as const },
      ]
      expect(mapper.detectCircularDependencies(actions, deps)).toBe(true)
    })
  })

  describe("computeExecutionOrder", () => {
    it("should place independent actions at level 0", () => {
      const actions = [
        makeAction({ id: "a1", description: "Independent A" }),
        makeAction({ id: "a2", description: "Independent B" }),
      ]
      const deps: any[] = []

      const order = mapper.computeExecutionOrder(actions, deps)
      expect(order).toHaveLength(1)
      expect(order[0].level).toBe(0)
      expect(order[0].actionIds).toHaveLength(2)
    })

    it("should order dependent actions after their prerequisites", () => {
      const actions = [
        makeAction({ id: "a1", description: "Setup" }),
        makeAction({ id: "a2", description: "Build" }),
        makeAction({ id: "a3", description: "Deploy" }),
      ]
      const deps = [
        { id: "d1", fromActionId: "a2", toActionId: "a1", type: "requires" as const },
        { id: "d2", fromActionId: "a3", toActionId: "a2", type: "requires" as const },
      ]

      const order = mapper.computeExecutionOrder(actions, deps)
      expect(order.length).toBeGreaterThanOrEqual(2)
      // a1 should be at level 0, a2 at level 1, a3 at level 2
      expect(order[0].actionIds).toContain("a1")

      // Find a3's level - should be after a2
      const a3Level = order.find((g) => g.actionIds.includes("a3"))?.level ?? -1
      const a2Level = order.find((g) => g.actionIds.includes("a2"))?.level ?? -1
      expect(a3Level).toBeGreaterThan(a2Level)
    })

    it("should return empty for no actions", () => {
      const order = mapper.computeExecutionOrder([], [])
      expect(order).toHaveLength(0)
    })
  })

  describe("buildGraph", () => {
    it("should produce a complete dependency graph", () => {
      const actions = [
        makeAction({ id: "a1", description: "Create the API endpoint" }),
        makeAction({ id: "a2", description: "Test the API endpoint" }),
        makeAction({ id: "a3", description: "Deploy the application" }),
      ]

      const graph = mapper.buildGraph(actions)
      expect(graph.dependencies.length).toBeGreaterThanOrEqual(1)
      expect(graph.executionOrder.length).toBeGreaterThanOrEqual(1)
      expect(graph.hasCircularDependency).toBe(false)
    })

    it("should handle circular dependencies gracefully", () => {
      const actions = [
        makeAction({ id: "a1", description: "Review changes", dependencies: ["a2"] }),
        makeAction({ id: "a2", description: "Review changes", dependencies: ["a1"] }),
      ]

      const graph = mapper.buildGraph(actions)
      expect(graph.hasCircularDependency).toBe(true)
      expect(graph.circularPath).toBeDefined()
    })
  })
})
