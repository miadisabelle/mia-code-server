import * as fs from "fs"
import * as os from "os"
import * as path from "path"
import { WorkspaceStore } from "../../../../../src/node/mia/workspace-lifecycle/store"
import { WorkspaceLifecycleEngine } from "../../../../../src/node/mia/workspace-lifecycle/engine"
import { WorkspaceEvent } from "../../../../../src/node/mia/workspace-lifecycle/types"

describe("WorkspaceLifecycleEngine", () => {
  let storePath: string
  let store: WorkspaceStore
  let engine: WorkspaceLifecycleEngine
  let events: WorkspaceEvent[]

  beforeEach(() => {
    storePath = fs.mkdtempSync(path.join(os.tmpdir(), "ws-engine-test-"))
    store = new WorkspaceStore(storePath)
    engine = new WorkspaceLifecycleEngine(store)
    events = []
    engine.on((event) => events.push(event))
  })

  afterEach(() => {
    fs.rmSync(storePath, { recursive: true, force: true })
  })

  describe("createWorkspace", () => {
    it("should create a workspace in germinating/task phase", async () => {
      const ws = await engine.createWorkspace("Build a login form")

      expect(ws.id).toBeTruthy()
      expect(ws.status).toBe("germinating")
      expect(ws.phase).toBe("task")
      expect(ws.task.description).toBe("Build a login form")
      expect(ws.task.creativeIntent).toBe("Build a login form")
      expect(ws.narrativeArc.creativePhase).toBe("germination")
      expect(ws.narrativeArc.tensionLevel).toBe(1.0)
      expect(ws.narrativeArc.beats).toHaveLength(1)
      expect(ws.narrativeArc.beats[0].event).toBe("workspace:created")
      expect(ws.versionHistory).toHaveLength(1)
    })

    it("should emit workspace:created event", async () => {
      await engine.createWorkspace("Test task")
      expect(events).toHaveLength(1)
      expect(events[0].type).toBe("workspace:created")
    })

    it("should accept source and sourceId", async () => {
      const ws = await engine.createWorkspace("Fix bug #42", "github-issue", "42")
      expect(ws.task.source).toBe("github-issue")
      expect(ws.task.sourceId).toBe("42")
    })
  })

  describe("getWorkspace / listWorkspaces", () => {
    it("should retrieve a created workspace", async () => {
      const created = await engine.createWorkspace("Test")
      const fetched = await engine.getWorkspace(created.id)
      expect(fetched).not.toBeNull()
      expect(fetched!.id).toBe(created.id)
    })

    it("should list all workspaces", async () => {
      await engine.createWorkspace("Task 1")
      await engine.createWorkspace("Task 2")
      const list = await engine.listWorkspaces()
      expect(list).toHaveLength(2)
    })
  })

  describe("updateTask", () => {
    it("should update task description and track edit", async () => {
      const ws = await engine.createWorkspace("Original task")
      const updated = await engine.updateTask(ws.id, "Refined task")

      expect(updated.task.description).toBe("Refined task")
      expect(updated.task.edits).toHaveLength(1)
      expect(updated.task.edits[0].previousDescription).toBe("Original task")
      expect(updated.task.edits[0].newDescription).toBe("Refined task")
    })

    it("should throw for nonexistent workspace", async () => {
      await expect(engine.updateTask("nonexistent", "new desc")).rejects.toThrow("not found")
    })
  })

  describe("generateSpec (interactive STC)", () => {
    it("should generate spec and advance to spec phase", async () => {
      const ws = await engine.createWorkspace("Add dashboard")
      const specced = await engine.generateSpec(
        ws.id,
        ["No dashboard exists", "Data is in the database"],
        ["Dashboard displays real-time metrics", "Charts update every 5 seconds"],
      )

      expect(specced.phase).toBe("spec")
      expect(specced.status).toBe("germinating")
      expect(specced.spec).toBeTruthy()
      expect(specced.spec!.currentReality).toHaveLength(2)
      expect(specced.spec!.desiredOutcome).toHaveLength(2)
      expect(specced.spec!.currentReality[0].text).toBe("No dashboard exists")
      expect(specced.spec!.desiredOutcome[0].text).toBe("Dashboard displays real-time metrics")
      expect(specced.stcChartId).toBeTruthy()
    })

    it("should reduce tension level after spec", async () => {
      const ws = await engine.createWorkspace("Task")
      const specced = await engine.generateSpec(ws.id, ["reality"], ["outcome"])
      expect(specced.narrativeArc.tensionLevel).toBeLessThan(1.0)
    })

    it("should emit phase-changed event", async () => {
      const ws = await engine.createWorkspace("Task")
      events = [] // Clear create event
      await engine.generateSpec(ws.id, ["r"], ["o"])
      expect(events.some((e) => e.type === "workspace:phase-changed")).toBe(true)
    })
  })

  describe("addSpecItem / editSpecItem / removeSpecItem", () => {
    it("should add a user spec item", async () => {
      const ws = await engine.createWorkspace("Task")
      await engine.generateSpec(ws.id, ["reality"], ["outcome"])

      const updated = await engine.addSpecItem(ws.id, "desiredOutcome", "New user requirement")
      expect(updated.spec!.desiredOutcome).toHaveLength(2)
      expect(updated.spec!.desiredOutcome[1].addedBy).toBe("user")
      expect(updated.spec!.editHistory).toHaveLength(1)
    })

    it("should edit an existing spec item", async () => {
      const ws = await engine.createWorkspace("Task")
      const specced = await engine.generateSpec(ws.id, ["old reality"], ["outcome"])
      const itemId = specced.spec!.currentReality[0].id

      const updated = await engine.editSpecItem(ws.id, itemId, "updated reality")
      expect(updated.spec!.currentReality[0].text).toBe("updated reality")
      expect(updated.spec!.currentReality[0].addedBy).toBe("user")
    })

    it("should remove a spec item", async () => {
      const ws = await engine.createWorkspace("Task")
      const specced = await engine.generateSpec(ws.id, ["r1", "r2"], ["o"])
      const itemId = specced.spec!.currentReality[0].id

      const updated = await engine.removeSpecItem(ws.id, itemId)
      expect(updated.spec!.currentReality).toHaveLength(1)
    })

    it("should throw when editing without spec", async () => {
      const ws = await engine.createWorkspace("Task")
      await expect(engine.addSpecItem(ws.id, "currentReality", "text")).rejects.toThrow("no specification")
    })

    it("should throw for nonexistent item", async () => {
      const ws = await engine.createWorkspace("Task")
      await engine.generateSpec(ws.id, ["r"], ["o"])
      await expect(engine.editSpecItem(ws.id, "nonexistent", "text")).rejects.toThrow("not found")
    })
  })

  describe("generatePlan", () => {
    it("should generate plan and advance to plan/assimilating", async () => {
      const ws = await engine.createWorkspace("Task")
      await engine.generateSpec(ws.id, ["r"], ["o"])

      const planned = await engine.generatePlan(ws.id, [
        { path: "src/dashboard.ts", operation: "create", actions: ["Create component", "Add styles"] },
        { path: "src/api.ts", operation: "modify", actions: ["Add endpoint"] },
      ])

      expect(planned.phase).toBe("plan")
      expect(planned.status).toBe("assimilating")
      expect(planned.plan).toBeTruthy()
      expect(planned.plan!.files).toHaveLength(2)
      expect(planned.plan!.files[0].actions).toHaveLength(2)
      expect(planned.narrativeArc.creativePhase).toBe("assimilation")
    })

    it("should throw without spec", async () => {
      const ws = await engine.createWorkspace("Task")
      await expect(engine.generatePlan(ws.id, [])).rejects.toThrow("without specification")
    })
  })

  describe("addCodeChanges", () => {
    it("should add code changes and advance to code phase", async () => {
      const ws = await engine.createWorkspace("Task")
      await engine.generateSpec(ws.id, ["r"], ["o"])
      await engine.generatePlan(ws.id, [{ path: "f.ts", operation: "create", actions: ["Create"] }])

      const coded = await engine.addCodeChanges(ws.id, [
        {
          fileId: "f1",
          filePath: "f.ts",
          operation: "create",
          diff: "+export const x = 1",
          newContent: "export const x = 1",
          status: "generated",
        },
      ])

      expect(coded.phase).toBe("code")
      expect(coded.codeChanges).toHaveLength(1)
      expect(coded.narrativeArc.tensionLevel).toBeLessThan(1.0)
    })
  })

  describe("full lifecycle: Germination → Assimilation → Completion", () => {
    it("should progress through all creative phases", async () => {
      // Germination: Task
      const ws = await engine.createWorkspace("Build authentication system")
      expect(ws.narrativeArc.creativePhase).toBe("germination")

      // Germination: Spec (interactive STC)
      const specced = await engine.generateSpec(
        ws.id,
        ["No auth system exists", "Users cannot log in"],
        ["JWT-based authentication", "Login/logout endpoints", "Token refresh"],
      )
      expect(specced.narrativeArc.creativePhase).toBe("germination")

      // User steers the spec
      await engine.addSpecItem(ws.id, "desiredOutcome", "Password hashing with bcrypt")

      // Assimilation: Plan
      const planned = await engine.generatePlan(ws.id, [
        { path: "src/auth/jwt.ts", operation: "create", actions: ["JWT token generation", "Token validation"] },
        { path: "src/auth/routes.ts", operation: "create", actions: ["Login endpoint", "Logout endpoint"] },
        { path: "src/auth/hash.ts", operation: "create", actions: ["bcrypt password hashing"] },
      ])
      expect(planned.narrativeArc.creativePhase).toBe("assimilation")

      // Assimilation: Code
      const coded = await engine.addCodeChanges(ws.id, [
        {
          fileId: "f1",
          filePath: "src/auth/jwt.ts",
          operation: "create",
          diff: "+import jwt from 'jsonwebtoken'",
          newContent: "import jwt from 'jsonwebtoken'",
          status: "generated",
        },
      ])
      expect(coded.narrativeArc.creativePhase).toBe("assimilation")

      // Completion: Validate
      const validated = await engine.startValidation(ws.id)
      expect(validated.narrativeArc.creativePhase).toBe("completion")
      expect(validated.status).toBe("completing")

      // Completion: Complete
      const completed = await engine.completeWorkspace(ws.id)
      expect(completed.phase).toBe("complete")
      expect(completed.status).toBe("resolved")
      expect(completed.narrativeArc.tensionLevel).toBe(0)
      expect(completed.narrativeArc.beats.length).toBeGreaterThanOrEqual(6)

      // Verify the narrative arc tells the story
      const beatEvents = completed.narrativeArc.beats.map((b) => b.event)
      expect(beatEvents).toContain("workspace:created")
      expect(beatEvents).toContain("spec:generated")
      expect(beatEvents).toContain("spec:item-added")
      expect(beatEvents).toContain("plan:generated")
      expect(beatEvents).toContain("code:generated")
      expect(beatEvents).toContain("workspace:completed")
    })
  })

  describe("abandonWorkspace", () => {
    it("should mark workspace as abandoned", async () => {
      const ws = await engine.createWorkspace("Abandoned task")
      const abandoned = await engine.abandonWorkspace(ws.id)

      expect(abandoned.status).toBe("abandoned")
      expect(abandoned.narrativeArc.beats.slice(-1)[0].event).toBe("workspace:abandoned")
    })
  })

  describe("deleteWorkspace", () => {
    it("should delete a workspace", async () => {
      const ws = await engine.createWorkspace("To delete")
      const deleted = await engine.deleteWorkspace(ws.id)
      expect(deleted).toBe(true)

      const fetched = await engine.getWorkspace(ws.id)
      expect(fetched).toBeNull()
    })
  })

  describe("event system", () => {
    it("should emit events for all major operations", async () => {
      const ws = await engine.createWorkspace("Event test")
      await engine.generateSpec(ws.id, ["r"], ["o"])
      await engine.generatePlan(ws.id, [{ path: "f.ts", operation: "create", actions: ["a"] }])
      await engine.addCodeChanges(ws.id, [
        { fileId: "f1", filePath: "f.ts", operation: "create", diff: "+x", newContent: "x", status: "generated" },
      ])
      await engine.completeWorkspace(ws.id)

      const eventTypes = events.map((e) => e.type)
      expect(eventTypes).toContain("workspace:created")
      expect(eventTypes).toContain("workspace:phase-changed")
      expect(eventTypes).toContain("workspace:code-generated")
      expect(eventTypes).toContain("workspace:completed")
    })

    it("should allow removing listeners", async () => {
      const listener = jest.fn()
      engine.on(listener)
      engine.off(listener)

      await engine.createWorkspace("No event")
      expect(listener).not.toHaveBeenCalled()
    })
  })
})
