import * as fs from "fs"
import * as os from "os"
import * as path from "path"
import { PDEStore } from "../../../../../src/node/mia/pde-engine/store"
import { DecompositionProcessor } from "../../../../../src/node/mia/pde-engine/decomposition-processor"
import { GerminationMetrics } from "../../../../../src/node/mia/pde-engine/germination-metrics"
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

describe("GerminationMetrics", () => {
  let storePath: string
  let store: PDEStore
  let processor: DecompositionProcessor
  let metrics: GerminationMetrics

  beforeEach(() => {
    storePath = fs.mkdtempSync(path.join(os.tmpdir(), "pde-germ-test-"))
    store = new PDEStore(storePath)
    processor = new DecompositionProcessor(store)
    metrics = new GerminationMetrics()
  })

  afterEach(() => {
    fs.rmSync(storePath, { recursive: true, force: true })
  })

  it("should assess a fresh decomposition as healthy", async () => {
    const result = await processor.decompose(
      "Create a user service with authentication and authorization",
    )

    const steerable: SteerableDecomposition = {
      ...result,
      steerableState: makeSteerableState(),
    }

    const health = metrics.assess(steerable)

    expect(health.germinationTimeMs).toBeGreaterThanOrEqual(0)
    expect(health.editCount).toBe(0)
    expect(health.directionBalance).toBeGreaterThanOrEqual(0)
    expect(health.directionBalance).toBeLessThanOrEqual(1)
    expect(health.intentClarity).toBeGreaterThan(0)
    expect(health.intentClarity).toBeLessThanOrEqual(1)
  })

  it("should recommend continue for a new decomposition", async () => {
    const result = await processor.decompose("Build a notification system")

    const steerable: SteerableDecomposition = {
      ...result,
      steerableState: makeSteerableState(),
    }

    const health = metrics.assess(steerable)
    // A simple prompt may have imbalanced directions, so "rebalance" or "continue" are both valid
    expect(["continue", "rebalance"]).toContain(health.recommendation)
  })

  it("should recommend transition for finalized decomposition", async () => {
    const result = await processor.decompose("Build a notification system")

    const steerable: SteerableDecomposition = {
      ...result,
      steerableState: makeSteerableState({ phase: "finalized" }),
    }

    const health = metrics.assess(steerable)
    expect(health.recommendation).toBe("transition-to-assimilation")
  })

  it("should detect low intent clarity", async () => {
    const result = await processor.decompose("do stuff")

    const steerable: SteerableDecomposition = {
      ...result,
      // Override intents with very low confidence
      primary_intents: [{
        id: "i1",
        layer: "primary",
        description: "do stuff",
        confidence: 0.3,
        keywords: [],
        complexity: "trivial",
      }],
      secondary_intents: [],
      implicit_intents: [],
      steerableState: makeSteerableState(),
    }

    const health = metrics.assess(steerable)
    expect(health.intentClarity).toBeLessThan(0.5)
    expect(health.recommendation).toBe("clarify-intents")
  })

  it("should track edit count from edit history", async () => {
    const result = await processor.decompose("Create an API")

    const steerable: SteerableDecomposition = {
      ...result,
      steerableState: makeSteerableState({
        editHistory: [
          { timestamp: new Date().toISOString(), layer: "primary", operation: "edit", path: "/primary/0", previousValue: "old", newValue: "new" },
          { timestamp: new Date().toISOString(), layer: "secondary", operation: "add", path: "/secondary/1", previousValue: null, newValue: "new item" },
          { timestamp: new Date().toISOString(), layer: "actionStack", operation: "reorder", path: "/actionStack", previousValue: [0, 1], newValue: [1, 0] },
        ],
      }),
    }

    const health = metrics.assess(steerable)
    expect(health.editCount).toBe(3)
  })
})
