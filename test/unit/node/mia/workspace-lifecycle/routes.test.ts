import express = require("express")
import * as fs from "fs"
import * as http from "http"
import * as os from "os"
import * as path from "path"
import { WorkspaceStore } from "../../../../../src/node/mia/workspace-lifecycle/store"
import { WorkspaceLifecycleEngine } from "../../../../../src/node/mia/workspace-lifecycle/engine"
import { createWorkspaceRouter } from "../../../../../src/node/mia/workspace-lifecycle/routes"

function createTestApp(engine: WorkspaceLifecycleEngine): express.Express {
  const app = express()
  app.use(express.json())
  app.use("/api/workspace", createWorkspaceRouter(engine))
  return app
}

function request(
  server: http.Server,
  method: string,
  path: string,
  body?: unknown,
): Promise<{ status: number; body: any }> {
  return new Promise((resolve, reject) => {
    const addr = server.address() as { port: number }
    const options: http.RequestOptions = {
      hostname: "127.0.0.1",
      port: addr.port,
      path,
      method,
      headers: { "Content-Type": "application/json" },
    }

    const req = http.request(options, (res) => {
      let data = ""
      res.on("data", (chunk) => (data += chunk))
      res.on("end", () => {
        let parsed: any = null
        try {
          parsed = data ? JSON.parse(data) : null
        } catch {
          parsed = data
        }
        resolve({ status: res.statusCode!, body: parsed })
      })
    })

    req.on("error", reject)
    if (body) {
      req.write(JSON.stringify(body))
    }
    req.end()
  })
}

describe("Workspace Routes", () => {
  let storePath: string
  let engine: WorkspaceLifecycleEngine
  let app: express.Express
  let server: http.Server

  beforeEach((done) => {
    storePath = fs.mkdtempSync(path.join(os.tmpdir(), "ws-routes-test-"))
    const store = new WorkspaceStore(storePath)
    engine = new WorkspaceLifecycleEngine(store)
    app = createTestApp(engine)
    server = app.listen(0, done)
  })

  afterEach((done) => {
    server.close(() => {
      fs.rmSync(storePath, { recursive: true, force: true })
      done()
    })
  })

  describe("POST /api/workspace/", () => {
    it("should create a workspace", async () => {
      const res = await request(server, "POST", "/api/workspace/", {
        task: "Build a feature",
      })
      expect(res.status).toBe(201)
      expect(res.body.id).toBeTruthy()
      expect(res.body.task.description).toBe("Build a feature")
      expect(res.body.status).toBe("germinating")
    })

    it("should return 400 without task", async () => {
      const res = await request(server, "POST", "/api/workspace/", {})
      expect(res.status).toBe(400)
    })
  })

  describe("GET /api/workspace/", () => {
    it("should list workspaces", async () => {
      await request(server, "POST", "/api/workspace/", { task: "Task 1" })
      await request(server, "POST", "/api/workspace/", { task: "Task 2" })

      const res = await request(server, "GET", "/api/workspace/")
      expect(res.status).toBe(200)
      expect(res.body).toHaveLength(2)
    })
  })

  describe("GET /api/workspace/:id", () => {
    it("should get workspace details", async () => {
      const create = await request(server, "POST", "/api/workspace/", { task: "Task" })
      const res = await request(server, "GET", `/api/workspace/${create.body.id}`)
      expect(res.status).toBe(200)
      expect(res.body.id).toBe(create.body.id)
    })

    it("should return 404 for nonexistent", async () => {
      const res = await request(server, "GET", "/api/workspace/nonexistent")
      expect(res.status).toBe(404)
    })
  })

  describe("DELETE /api/workspace/:id", () => {
    it("should delete workspace", async () => {
      const create = await request(server, "POST", "/api/workspace/", { task: "Task" })
      const res = await request(server, "DELETE", `/api/workspace/${create.body.id}`)
      expect(res.status).toBe(204)

      const get = await request(server, "GET", `/api/workspace/${create.body.id}`)
      expect(get.status).toBe(404)
    })
  })

  describe("PATCH /api/workspace/:id/task", () => {
    it("should update task description", async () => {
      const create = await request(server, "POST", "/api/workspace/", { task: "Old task" })
      const res = await request(server, "PATCH", `/api/workspace/${create.body.id}/task`, {
        description: "New task",
      })
      expect(res.status).toBe(200)
      expect(res.body.task.description).toBe("New task")
    })
  })

  describe("POST /api/workspace/:id/phase/spec", () => {
    it("should generate specification", async () => {
      const create = await request(server, "POST", "/api/workspace/", { task: "Task" })
      const res = await request(server, "POST", `/api/workspace/${create.body.id}/phase/spec`, {
        currentReality: ["No feature exists"],
        desiredOutcome: ["Feature works"],
      })
      expect(res.status).toBe(200)
      expect(res.body.phase).toBe("spec")
      expect(res.body.spec.currentReality).toHaveLength(1)
      expect(res.body.spec.desiredOutcome).toHaveLength(1)
    })
  })

  describe("spec item operations", () => {
    it("should add, edit, and remove spec items", async () => {
      const create = await request(server, "POST", "/api/workspace/", { task: "Task" })
      const id = create.body.id
      await request(server, "POST", `/api/workspace/${id}/phase/spec`, {
        currentReality: ["Reality"],
        desiredOutcome: ["Outcome"],
      })

      // Add item
      const addRes = await request(server, "POST", `/api/workspace/${id}/spec/items`, {
        text: "New requirement",
        column: "desiredOutcome",
      })
      expect(addRes.status).toBe(200)
      expect(addRes.body.spec.desiredOutcome).toHaveLength(2)

      // Get the item ID
      const itemId = addRes.body.spec.desiredOutcome[1].id

      // Edit item
      const editRes = await request(server, "PATCH", `/api/workspace/${id}/spec/items/${itemId}`, {
        text: "Updated requirement",
      })
      expect(editRes.status).toBe(200)
      expect(editRes.body.spec.desiredOutcome[1].text).toBe("Updated requirement")

      // Remove item
      const removeRes = await request(server, "DELETE", `/api/workspace/${id}/spec/items/${itemId}`)
      expect(removeRes.status).toBe(200)
      expect(removeRes.body.spec.desiredOutcome).toHaveLength(1)
    })
  })

  describe("POST /api/workspace/:id/phase/plan", () => {
    it("should generate plan", async () => {
      const create = await request(server, "POST", "/api/workspace/", { task: "Task" })
      const id = create.body.id
      await request(server, "POST", `/api/workspace/${id}/phase/spec`, {
        currentReality: ["R"],
        desiredOutcome: ["O"],
      })

      const res = await request(server, "POST", `/api/workspace/${id}/phase/plan`, {
        files: [
          { path: "src/x.ts", operation: "create", actions: ["Create module"] },
        ],
      })
      expect(res.status).toBe(200)
      expect(res.body.phase).toBe("plan")
      expect(res.body.plan.files).toHaveLength(1)
    })
  })

  describe("full lifecycle via API", () => {
    it("should complete full lifecycle through API", async () => {
      // Create
      const create = await request(server, "POST", "/api/workspace/", {
        task: "Build auth system",
      })
      const id = create.body.id

      // Spec
      await request(server, "POST", `/api/workspace/${id}/phase/spec`, {
        currentReality: ["No auth"],
        desiredOutcome: ["JWT auth"],
      })

      // Plan
      await request(server, "POST", `/api/workspace/${id}/phase/plan`, {
        files: [{ path: "auth.ts", operation: "create", actions: ["JWT"] }],
      })

      // Code
      await request(server, "POST", `/api/workspace/${id}/phase/code`, {
        changes: [
          {
            fileId: "f1",
            filePath: "auth.ts",
            operation: "create",
            diff: "+jwt",
            newContent: "jwt",
            status: "generated",
          },
        ],
      })

      // Validate
      await request(server, "POST", `/api/workspace/${id}/phase/validate`)

      // Complete
      const complete = await request(server, "POST", `/api/workspace/${id}/complete`)
      expect(complete.status).toBe(200)
      expect(complete.body.status).toBe("resolved")
      expect(complete.body.phase).toBe("complete")
      expect(complete.body.narrativeArc.tensionLevel).toBe(0)
    })
  })
})
