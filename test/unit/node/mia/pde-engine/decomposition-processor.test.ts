import * as fs from "fs"
import * as os from "os"
import * as path from "path"
import { PDEStore } from "../../../../../src/node/mia/pde-engine/store"
import { DecompositionProcessor } from "../../../../../src/node/mia/pde-engine/decomposition-processor"

describe("DecompositionProcessor", () => {
  let storePath: string
  let store: PDEStore
  let processor: DecompositionProcessor

  beforeEach(() => {
    storePath = fs.mkdtempSync(path.join(os.tmpdir(), "pde-processor-test-"))
    store = new PDEStore(storePath)
    processor = new DecompositionProcessor(store)
  })

  afterEach(() => {
    fs.rmSync(storePath, { recursive: true, force: true })
  })

  describe("decompose", () => {
    it("should produce a complete decomposition result", async () => {
      const result = await processor.decompose(
        "Create a REST API for user management with JWT authentication. " +
          "Add input validation and error handling. " +
          "Maybe add rate limiting if possible.",
      )

      // Basic structure
      expect(result.id).toBeTruthy()
      expect(result.timestamp).toBeTruthy()
      expect(result.original_prompt).toContain("REST API")

      // Intents
      expect(result.primary_intents.length).toBeGreaterThanOrEqual(1)
      expect(result.primary_intents[0].layer).toBe("primary")
      expect(result.primary_intents[0].confidence).toBeGreaterThan(0)

      // Implicit intents from hedging
      expect(result.implicit_intents.length).toBeGreaterThanOrEqual(1)

      // Actions
      expect(result.action_stack.length).toBeGreaterThanOrEqual(1)
      expect(result.action_stack[0].status).toBe("pending")

      // Four Directions
      expect(result.four_directions).toBeDefined()
      const totalEnergy =
        result.four_directions.north.energy_level +
        result.four_directions.east.energy_level +
        result.four_directions.south.energy_level +
        result.four_directions.west.energy_level
      expect(totalEnergy).toBeGreaterThan(0)

      // Dependency Graph
      expect(result.dependency_graph).toBeDefined()
      expect(result.dependency_graph.hasCircularDependency).toBe(false)
    })

    it("should persist the decomposition", async () => {
      const result = await processor.decompose("Build a dashboard")
      const retrieved = await processor.get(result.id)
      expect(retrieved).not.toBeNull()
      expect(retrieved!.id).toBe(result.id)
    })

    it("should handle short prompts", async () => {
      const result = await processor.decompose("Fix bug")
      expect(result.primary_intents.length).toBeGreaterThanOrEqual(1)
      // Short prompts should trigger ambiguity
      expect(result.ambiguities.some((a) => a.type === "vague-scope")).toBe(true)
    })

    it("should handle complex multi-line prompts", async () => {
      const result = await processor.decompose(
        "1. Design the system architecture for a microservices platform\n" +
          "2. Create the user service with JWT auth\n" +
          "3. Build a React dashboard\n" +
          "4. Test all integration points\n" +
          "5. Refactor the legacy authentication module\n" +
          "6. Deploy to production",
      )

      expect(result.primary_intents.length).toBeGreaterThanOrEqual(2)
      expect(result.action_stack.length).toBeGreaterThanOrEqual(2)

      // Should have energy in multiple directions
      const directions = result.four_directions
      const activeDirections = [
        directions.north.energy_level,
        directions.east.energy_level,
        directions.south.energy_level,
        directions.west.energy_level,
      ].filter((e) => e > 0)
      expect(activeDirections.length).toBeGreaterThanOrEqual(2)
    })
  })

  describe("list", () => {
    it("should list decompositions", async () => {
      await processor.decompose("Task A")
      await processor.decompose("Task B")
      const summaries = await processor.list()
      expect(summaries).toHaveLength(2)
    })
  })

  describe("delete", () => {
    it("should delete a decomposition", async () => {
      const result = await processor.decompose("Task to delete")
      const deleted = await processor.delete(result.id)
      expect(deleted).toBe(true)
      const retrieved = await processor.get(result.id)
      expect(retrieved).toBeNull()
    })
  })

  describe("exportMarkdown", () => {
    it("should export markdown for a decomposition", async () => {
      const result = await processor.decompose("Build an authentication system with OAuth")
      const md = await processor.exportMarkdown(result.id)

      expect(md).not.toBeNull()
      expect(md).toContain("# Decomposition:")
      expect(md).toContain("## Primary Intents")
      expect(md).toContain("## Four Directions")
    })

    it("should return null for nonexistent decomposition", async () => {
      const md = await processor.exportMarkdown("nonexistent")
      expect(md).toBeNull()
    })
  })

  describe("assessBalance", () => {
    it("should return a balance report", async () => {
      const result = await processor.decompose(
        "Design the architecture. Create the service. Test everything. Refactor the code.",
      )
      const report = await processor.assessBalance(result.id)

      expect(report).not.toBeNull()
      expect(report!.overallHealth).toBeGreaterThanOrEqual(0)
      expect(report!.overallHealth).toBeLessThanOrEqual(1)
    })

    it("should return null for nonexistent decomposition", async () => {
      const report = await processor.assessBalance("nonexistent")
      expect(report).toBeNull()
    })
  })

  describe("full pipeline: Decompose → Analyze → Balance → Export", () => {
    it("should process end-to-end", async () => {
      // Decompose
      const result = await processor.decompose(
        "Build a comprehensive project management tool. " +
          "Design the data model and API architecture. " +
          "Create CRUD endpoints for projects and tasks. " +
          "Add unit and integration tests. " +
          "Refactor the existing utility modules for reuse. " +
          "Maybe add a notification system eventually.",
      )

      // Verify decomposition
      expect(result.primary_intents.length).toBeGreaterThanOrEqual(1)
      expect(result.secondary_intents.length).toBeGreaterThanOrEqual(0)
      expect(result.implicit_intents.length).toBeGreaterThanOrEqual(1) // "maybe" → implicit

      // Verify actions were generated
      expect(result.action_stack.length).toBeGreaterThanOrEqual(2)

      // Check balance
      const report = await processor.assessBalance(result.id)
      expect(report).not.toBeNull()
      expect(typeof report!.isBalanced).toBe("boolean")
      expect(report!.dominantDirection).toBeTruthy()

      // Export markdown
      const md = await processor.exportMarkdown(result.id)
      expect(md).not.toBeNull()
      expect(md!.length).toBeGreaterThan(100)

      // List shows it
      const list = await processor.list()
      expect(list).toHaveLength(1)
      expect(list[0].id).toBe(result.id)
    })
  })
})
