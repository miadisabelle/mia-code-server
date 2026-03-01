import * as fs from "fs"
import * as os from "os"
import * as path from "path"
import { PDEStore } from "../../../../../src/node/mia/pde-engine/store"
import { DecompositionResult } from "../../../../../src/node/mia/pde-engine/types"
import { emptyFourDirections } from "../../../../../src/node/mia/pde-engine/direction-analyzer"

function makeDecomposition(overrides: Partial<DecompositionResult> = {}): DecompositionResult {
  const now = new Date().toISOString()
  return {
    id: `test-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: now,
    original_prompt: "Test prompt",
    primary_intents: [],
    secondary_intents: [],
    implicit_intents: [],
    action_stack: [],
    ambiguities: [],
    four_directions: emptyFourDirections(),
    dependency_graph: {
      dependencies: [],
      executionOrder: [],
      hasCircularDependency: false,
    },
    ...overrides,
  }
}

describe("PDEStore", () => {
  let storePath: string
  let store: PDEStore

  beforeEach(() => {
    storePath = fs.mkdtempSync(path.join(os.tmpdir(), "pde-store-test-"))
    store = new PDEStore(storePath)
  })

  afterEach(() => {
    fs.rmSync(storePath, { recursive: true, force: true })
  })

  describe("save and get", () => {
    it("should save and retrieve a decomposition", async () => {
      const result = makeDecomposition({ id: "pde-1", original_prompt: "Build a login" })
      await store.save(result)

      const retrieved = await store.get("pde-1")
      expect(retrieved).not.toBeNull()
      expect(retrieved!.id).toBe("pde-1")
      expect(retrieved!.original_prompt).toBe("Build a login")
    })

    it("should return null for nonexistent decomposition", async () => {
      const result = await store.get("nonexistent")
      expect(result).toBeNull()
    })
  })

  describe("delete", () => {
    it("should delete an existing decomposition", async () => {
      const result = makeDecomposition({ id: "pde-del" })
      await store.save(result)
      const deleted = await store.delete("pde-del")
      expect(deleted).toBe(true)

      const retrieved = await store.get("pde-del")
      expect(retrieved).toBeNull()
    })

    it("should return false for nonexistent decomposition", async () => {
      const deleted = await store.delete("nonexistent")
      expect(deleted).toBe(false)
    })
  })

  describe("list", () => {
    it("should list all decompositions as summaries", async () => {
      await store.save(makeDecomposition({ id: "pde-a" }))
      await store.save(makeDecomposition({ id: "pde-b" }))
      await store.save(makeDecomposition({ id: "pde-c" }))

      const summaries = await store.list()
      expect(summaries).toHaveLength(3)
      expect(summaries[0]).toHaveProperty("id")
      expect(summaries[0]).toHaveProperty("intentCount")
      expect(summaries[0]).toHaveProperty("actionCount")
    })

    it("should respect limit and offset", async () => {
      for (let i = 0; i < 10; i++) {
        await store.save(
          makeDecomposition({
            id: `pde-${i}`,
            timestamp: new Date(Date.now() - i * 1000).toISOString(),
          }),
        )
      }

      const page = await store.list({ limit: 3, offset: 2 })
      expect(page).toHaveLength(3)
    })

    it("should return empty array for empty store", async () => {
      const result = await store.list()
      expect(result).toEqual([])
    })
  })

  describe("exists", () => {
    it("should return true for existing decomposition", async () => {
      await store.save(makeDecomposition({ id: "pde-exists" }))
      expect(await store.exists("pde-exists")).toBe(true)
    })

    it("should return false for nonexistent decomposition", async () => {
      expect(await store.exists("nope")).toBe(false)
    })
  })

  describe("exportMarkdown", () => {
    it("should generate markdown with all sections", () => {
      const result = makeDecomposition({
        id: "md-test",
        original_prompt: "Build a comprehensive dashboard",
        primary_intents: [
          {
            id: "i1",
            layer: "primary",
            description: "Build a dashboard",
            confidence: 0.9,
            keywords: ["build", "dashboard"],
            complexity: "medium",
          },
        ],
        secondary_intents: [
          {
            id: "i2",
            layer: "secondary",
            description: "Setup data fetching",
            confidence: 0.7,
            keywords: ["setup", "data"],
            complexity: "medium",
          },
        ],
        action_stack: [
          {
            id: "a1",
            description: "Create dashboard component",
            intentId: "i1",
            status: "pending",
            order: 0,
            dependencies: [],
            estimatedEffort: "medium",
          },
        ],
        four_directions: {
          north: { intents: ["plan architecture"], energy_level: 0.25, balance_note: "Good" },
          east: { intents: ["build dashboard"], energy_level: 0.5, balance_note: "Strong" },
          south: { intents: [], energy_level: 0.25, balance_note: "Light" },
          west: { intents: [], energy_level: 0, balance_note: "Absent" },
        },
      })

      const md = store.exportMarkdown(result)

      expect(md).toContain("# Decomposition:")
      expect(md).toContain("## Primary Intents")
      expect(md).toContain("Build a dashboard")
      expect(md).toContain("## Secondary Intents")
      expect(md).toContain("## Four Directions")
      expect(md).toContain("North")
      expect(md).toContain("East")
      expect(md).toContain("South")
      expect(md).toContain("West")
      expect(md).toContain("## Action Stack")
      expect(md).toContain("Create dashboard component")
    })

    it("should include ambiguities when present", () => {
      const result = makeDecomposition({
        ambiguities: [
          {
            id: "amb-1",
            type: "vague-scope",
            description: "Prompt is too brief",
            relatedIntentIds: [],
            suggestedClarification: "Add more detail",
          },
        ],
      })

      const md = store.exportMarkdown(result)
      expect(md).toContain("## Ambiguities")
      expect(md).toContain("vague-scope")
    })
  })
})
