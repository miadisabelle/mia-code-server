import * as fs from "fs"
import * as os from "os"
import * as path from "path"
import { WorkspaceStore } from "../../../../../src/node/mia/workspace-lifecycle/store"
import { Workspace } from "../../../../../src/node/mia/workspace-lifecycle/types"

function makeWorkspace(overrides: Partial<Workspace> = {}): Workspace {
  const now = new Date().toISOString()
  return {
    id: `test-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: "Test Workspace",
    createdAt: now,
    updatedAt: now,
    status: "germinating",
    phase: "task",
    task: {
      description: "Test task",
      source: "natural-language",
      creativeIntent: "Test intent",
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

describe("WorkspaceStore", () => {
  let storePath: string
  let store: WorkspaceStore

  beforeEach(() => {
    storePath = fs.mkdtempSync(path.join(os.tmpdir(), "ws-store-test-"))
    store = new WorkspaceStore(storePath)
  })

  afterEach(() => {
    fs.rmSync(storePath, { recursive: true, force: true })
  })

  describe("save and get", () => {
    it("should save and retrieve a workspace", async () => {
      const ws = makeWorkspace({ id: "ws-1", title: "My Workspace" })
      await store.save(ws)

      const retrieved = await store.get("ws-1")
      expect(retrieved).not.toBeNull()
      expect(retrieved!.id).toBe("ws-1")
      expect(retrieved!.title).toBe("My Workspace")
      expect(retrieved!.status).toBe("germinating")
    })

    it("should return null for nonexistent workspace", async () => {
      const result = await store.get("nonexistent")
      expect(result).toBeNull()
    })
  })

  describe("delete", () => {
    it("should delete an existing workspace", async () => {
      const ws = makeWorkspace({ id: "ws-del" })
      await store.save(ws)
      const deleted = await store.delete("ws-del")
      expect(deleted).toBe(true)

      const retrieved = await store.get("ws-del")
      expect(retrieved).toBeNull()
    })

    it("should return false for nonexistent workspace", async () => {
      const deleted = await store.delete("nonexistent")
      expect(deleted).toBe(false)
    })
  })

  describe("list", () => {
    it("should list all workspaces", async () => {
      await store.save(makeWorkspace({ id: "ws-a", title: "A" }))
      await store.save(makeWorkspace({ id: "ws-b", title: "B" }))
      await store.save(makeWorkspace({ id: "ws-c", title: "C" }))

      const all = await store.list()
      expect(all).toHaveLength(3)
    })

    it("should filter by status", async () => {
      await store.save(makeWorkspace({ id: "ws-1", status: "germinating" }))
      await store.save(makeWorkspace({ id: "ws-2", status: "assimilating" }))
      await store.save(makeWorkspace({ id: "ws-3", status: "germinating" }))

      const germinating = await store.list({ status: "germinating" })
      expect(germinating).toHaveLength(2)
    })

    it("should filter by phase", async () => {
      await store.save(makeWorkspace({ id: "ws-1", phase: "task" }))
      await store.save(makeWorkspace({ id: "ws-2", phase: "spec" }))

      const specPhase = await store.list({ phase: "spec" })
      expect(specPhase).toHaveLength(1)
      expect(specPhase[0].id).toBe("ws-2")
    })

    it("should respect limit and offset", async () => {
      for (let i = 0; i < 10; i++) {
        await store.save(makeWorkspace({ id: `ws-${i}`, createdAt: new Date(Date.now() - i * 1000).toISOString() }))
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
    it("should return true for existing workspace", async () => {
      await store.save(makeWorkspace({ id: "ws-exists" }))
      expect(await store.exists("ws-exists")).toBe(true)
    })

    it("should return false for nonexistent workspace", async () => {
      expect(await store.exists("nope")).toBe(false)
    })
  })
})
