import { ActionMapper } from "../../../../../src/node/mia/pde-engine/action-mapper"
import { Action } from "../../../../../src/node/mia/pde-engine/types"

function makeAction(id: string, description: string): Action {
  return {
    id,
    description,
    intentId: "intent-1",
    status: "pending",
    order: 0,
    dependencies: [],
    estimatedEffort: "medium",
  }
}

describe("ActionMapper", () => {
  let mapper: ActionMapper

  beforeEach(() => {
    mapper = new ActionMapper()
  })

  it("should map file creation actions to file-system target", () => {
    const action = makeAction("a1", "Create file for user model")
    const result = mapper.map(action)
    expect(result.target).toBe("file-system")
    expect(result.isManual).toBe(false)
  })

  it("should map test actions to test-runner target", () => {
    const action = makeAction("a2", "Run tests for authentication module")
    const result = mapper.map(action)
    expect(result.target).toBe("test-runner")
    expect(result.isManual).toBe(false)
  })

  it("should map analysis actions to three-universe-analysis", () => {
    const action = makeAction("a3", "Analyze code quality across modules")
    const result = mapper.map(action)
    expect(result.target).toBe("three-universe-analysis")
    expect(result.isManual).toBe(false)
  })

  it("should map implementation actions to code-generation", () => {
    const action = makeAction("a4", "Implement the user service")
    const result = mapper.map(action)
    expect(result.target).toBe("code-generation")
    expect(result.isManual).toBe(false)
  })

  it("should flag unknown actions as manual", () => {
    const action = makeAction("a5", "Meditate on the meaning of code")
    const result = mapper.map(action)
    expect(result.target).toBe("manual")
    expect(result.isManual).toBe(true)
  })

  it("should map all actions in a stack", () => {
    const actions = [
      makeAction("a1", "Create file for schema"),
      makeAction("a2", "Run tests"),
      makeAction("a3", "Unknown cosmic action"),
    ]
    const results = mapper.mapAll(actions)
    expect(results.size).toBe(3)
    expect(results.get("a1")!.target).toBe("file-system")
    expect(results.get("a2")!.target).toBe("test-runner")
    expect(results.get("a3")!.isManual).toBe(true)
  })

  it("should count unmapped actions", () => {
    const actions = [
      makeAction("a1", "Create file"),
      makeAction("a2", "Something mysterious"),
      makeAction("a3", "Another mystery"),
    ]
    expect(mapper.countUnmapped(actions)).toBe(2)
  })

  it("should allow custom mappings that take priority", () => {
    mapper.addMapping({ pattern: "meditat", target: "three-universe-analysis", universe: "ceremony" })
    const action = makeAction("a1", "Meditate on code quality")
    const result = mapper.map(action)
    expect(result.target).toBe("three-universe-analysis")
    expect(result.universe).toBe("ceremony")
    expect(result.isManual).toBe(false)
  })
})
