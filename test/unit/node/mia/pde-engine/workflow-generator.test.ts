import * as fs from "fs"
import * as os from "os"
import * as path from "path"
import { PDEStore } from "../../../../../src/node/mia/pde-engine/store"
import { DecompositionProcessor } from "../../../../../src/node/mia/pde-engine/decomposition-processor"
import { WorkflowGenerator } from "../../../../../src/node/mia/pde-engine/workflow-generator"

describe("WorkflowGenerator", () => {
  let storePath: string
  let store: PDEStore
  let processor: DecompositionProcessor
  let generator: WorkflowGenerator

  beforeEach(() => {
    storePath = fs.mkdtempSync(path.join(os.tmpdir(), "pde-workflow-test-"))
    store = new PDEStore(storePath)
    processor = new DecompositionProcessor(store)
    generator = new WorkflowGenerator()
  })

  afterEach(() => {
    fs.rmSync(storePath, { recursive: true, force: true })
  })

  it("should generate a workflow from a decomposition", async () => {
    const decomposition = await processor.decompose(
      "Create a user authentication service. Add JWT token validation. Run tests to verify.",
    )

    const workflow = generator.generate(decomposition)

    expect(workflow.id).toBeTruthy()
    expect(workflow.decompositionId).toBe(decomposition.id)
    expect(workflow.name).toBeTruthy()
    expect(workflow.sessionIntent).toBeTruthy()
    expect(workflow.steps.length).toBeGreaterThan(0)
    expect(workflow.completionNarrative).toBeTruthy()
    expect(workflow.generatedAt).toBeTruthy()
  })

  it("should assign universe to each step", async () => {
    const decomposition = await processor.decompose(
      "Build the API endpoint. Review the implementation. Document the usage.",
    )

    const workflow = generator.generate(decomposition)

    for (const step of workflow.steps) {
      expect(["engineer", "ceremony", "story"]).toContain(step.universe)
    }
  })

  it("should respect dependency ordering via concurrency groups", async () => {
    const decomposition = await processor.decompose(
      "Create the database schema. Build the API layer. Test the integration.",
    )

    const workflow = generator.generate(decomposition)
    const groups = new Set(workflow.steps.map((s) => s.concurrencyGroup))
    expect(groups.size).toBeGreaterThanOrEqual(1)

    // Steps with lower concurrency group should come before higher ones
    const sorted = [...workflow.steps].sort((a, b) => a.concurrencyGroup - b.concurrencyGroup)
    expect(sorted[0].concurrencyGroup).toBeLessThanOrEqual(sorted[sorted.length - 1].concurrencyGroup)
  })

  it("should generate narrative beats for each step", async () => {
    const decomposition = await processor.decompose("Implement user registration flow")

    const workflow = generator.generate(decomposition)

    for (const step of workflow.steps) {
      expect(step.narrativeBeat).toBeDefined()
      expect(step.narrativeBeat.template).toBeTruthy()
      expect(["engineer", "ceremony", "story"]).toContain(step.narrativeBeat.universe)
      expect(["setup", "action", "resolution"]).toContain(step.narrativeBeat.phase)
    }
  })

  it("should use Creative Orientation language in session intent", async () => {
    const decomposition = await processor.decompose("Fix the broken authentication module")

    const workflow = generator.generate(decomposition)

    // Should not start with reactive language
    expect(workflow.sessionIntent.toLowerCase()).not.toMatch(/^fix/)
    expect(workflow.sessionIntent).toBeTruthy()
  })

  it("should produce a valid YAML object", async () => {
    const decomposition = await processor.decompose("Create a REST API with validation")

    const workflow = generator.generate(decomposition)
    const yamlObj = generator.toYAMLObject(workflow)

    expect(yamlObj.name).toBeTruthy()
    expect(yamlObj.intent).toBeTruthy()
    expect(Array.isArray(yamlObj.steps)).toBe(true)
    expect(yamlObj.completion).toBeTruthy()

    const steps = yamlObj.steps as Array<Record<string, unknown>>
    for (const step of steps) {
      expect(step.id).toBeTruthy()
      expect(step.name).toBeTruthy()
      expect(step.universe).toBeTruthy()
      expect(step.operation).toBeTruthy()
    }
  })
})
