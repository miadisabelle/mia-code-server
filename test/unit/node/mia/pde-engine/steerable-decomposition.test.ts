import * as fs from "fs"
import * as os from "os"
import * as path from "path"
import { PDEStore } from "../../../../../src/node/mia/pde-engine/store"
import { DecompositionProcessor } from "../../../../../src/node/mia/pde-engine/decomposition-processor"
import { LayerRegenerator } from "../../../../../src/node/mia/pde-engine/layer-regenerator"
import { DecompositionToWorkspace } from "../../../../../src/node/mia/pde-engine/decomposition-to-workspace"
import { SteerableDecomposition, SteerableState } from "../../../../../src/node/mia/pde-engine/types"

function makeSteerableState(overrides?: Partial<SteerableState>): SteerableState {
  return {
    phase: "initial",
    editHistory: [],
    stalenessMap: {
      primary: false,
      secondary: false,
      directions: false,
      actionStack: false,
      context: false,
    },
    lockedLayers: [],
    ...overrides,
  }
}

describe("LayerRegenerator", () => {
  let storePath: string
  let store: PDEStore
  let processor: DecompositionProcessor
  let regenerator: LayerRegenerator

  beforeEach(() => {
    storePath = fs.mkdtempSync(path.join(os.tmpdir(), "pde-regen-test-"))
    store = new PDEStore(storePath)
    processor = new DecompositionProcessor(store)
    regenerator = new LayerRegenerator()
  })

  afterEach(() => {
    fs.rmSync(storePath, { recursive: true, force: true })
  })

  it("should mark downstream layers stale when primary changes", async () => {
    const result = await processor.decompose("Create user service with auth")
    const steerable: SteerableDecomposition = {
      ...result,
      steerableState: makeSteerableState(),
    }

    const updated = regenerator.markStale(steerable, "primary")
    expect(updated.steerableState.stalenessMap.secondary).toBe(true)
    expect(updated.steerableState.stalenessMap.directions).toBe(true)
    expect(updated.steerableState.stalenessMap.actionStack).toBe(true)
  })

  it("should not mark locked layers as stale", async () => {
    const result = await processor.decompose("Create user service")
    const steerable: SteerableDecomposition = {
      ...result,
      steerableState: makeSteerableState({ lockedLayers: ["directions"] }),
    }

    const updated = regenerator.markStale(steerable, "primary")
    expect(updated.steerableState.stalenessMap.directions).toBe(false)
    expect(updated.steerableState.stalenessMap.secondary).toBe(true)
  })

  it("should regenerate directions layer", async () => {
    const result = await processor.decompose("Create user service. Test the integration.")
    const steerable: SteerableDecomposition = {
      ...result,
      steerableState: makeSteerableState({ stalenessMap: { primary: false, secondary: false, directions: true, actionStack: false, context: false } }),
    }

    const regenerated = regenerator.regenerateLayer(steerable, "directions")
    expect(regenerated.four_directions).toBeDefined()
    expect(regenerated.steerableState.stalenessMap.directions).toBe(false)
  })

  it("should not regenerate locked layers", async () => {
    const result = await processor.decompose("Create user service")
    const originalDirections = result.four_directions
    const steerable: SteerableDecomposition = {
      ...result,
      steerableState: makeSteerableState({ lockedLayers: ["directions"] }),
    }

    const regenerated = regenerator.regenerateLayer(steerable, "directions")
    expect(regenerated.four_directions).toEqual(originalDirections)
  })

  it("should report stale layers", async () => {
    const result = await processor.decompose("Build API")
    const steerable: SteerableDecomposition = {
      ...result,
      steerableState: makeSteerableState({
        stalenessMap: { primary: false, secondary: true, directions: true, actionStack: false, context: false },
      }),
    }

    const staleLayers = regenerator.getStaleLayers(steerable)
    expect(staleLayers).toContain("secondary")
    expect(staleLayers).toContain("directions")
    expect(staleLayers).not.toContain("primary")
  })
})

describe("DecompositionToWorkspace", () => {
  let storePath: string
  let store: PDEStore
  let processor: DecompositionProcessor
  let bridge: DecompositionToWorkspace

  beforeEach(() => {
    storePath = fs.mkdtempSync(path.join(os.tmpdir(), "pde-bridge-test-"))
    store = new PDEStore(storePath)
    processor = new DecompositionProcessor(store)
    bridge = new DecompositionToWorkspace()
  })

  afterEach(() => {
    fs.rmSync(storePath, { recursive: true, force: true })
  })

  it("should produce a workspace seed with all components", async () => {
    const result = await processor.decompose(
      "Create a notification service with email and SMS channels. Test all integrations.",
    )
    const steerable: SteerableDecomposition = {
      ...result,
      steerableState: makeSteerableState({ phase: "finalized" }),
    }

    const seed = bridge.finalize(steerable)

    // Task definition
    expect(seed.task.source).toBe("pde-decomposition")
    expect(seed.task.sourceId).toBe(result.id)
    expect(seed.task.description).toBeTruthy()
    expect(seed.task.creativeIntent).toBeTruthy()

    // Specification
    expect(seed.spec.version).toBe(1)
    expect(seed.spec.desiredOutcome.length).toBeGreaterThanOrEqual(0)

    // Implementation plan
    expect(seed.plan.version).toBe(1)
    expect(seed.plan.files.length).toBeGreaterThan(0)

    // Narrative arc
    expect(seed.narrativeArc.creativePhase).toBe("germination")
    expect(typeof seed.narrativeArc.tensionLevel).toBe("number")
  })

  it("should use primary intents as task description", async () => {
    const result = await processor.decompose("Build a real-time chat system")
    const steerable: SteerableDecomposition = {
      ...result,
      steerableState: makeSteerableState(),
    }

    const seed = bridge.finalize(steerable)
    expect(seed.task.description).toContain(result.primary_intents[0].description)
  })

  it("should map action stack to planned file changes", async () => {
    const result = await processor.decompose(
      "Create user model. Build user service. Add user routes.",
    )
    const steerable: SteerableDecomposition = {
      ...result,
      steerableState: makeSteerableState(),
    }

    const seed = bridge.finalize(steerable)
    expect(seed.plan.files.length).toBe(result.action_stack.length)
  })
})
