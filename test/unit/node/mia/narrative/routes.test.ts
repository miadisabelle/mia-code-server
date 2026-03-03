import * as express from "express"
import * as http from "http"
import fetch from "node-fetch"
import { NarrativeStore } from "../../../../../src/node/mia/narrative/store"
import { NarrativeEventBus } from "../../../../../src/node/mia/narrative/event-bus"
import { createSessionRouter } from "../../../../../src/node/mia/narrative/session-routes"
import { createHealthRouter } from "../../../../../src/node/mia/narrative/health-routes"
import { createNarrativeRouter } from "../../../../../src/node/mia/narrative/narrative-routes"
import { UniverseDispatcher, EngineerLens, CeremonyLens, StoryLens } from "../../../../../src/node/mia/three-universe"

describe("Narrative Routes (integration)", () => {
  let app: express.Express
  let server: http.Server
  let baseUrl: string
  let store: NarrativeStore
  let bus: NarrativeEventBus

  beforeAll((done) => {
    store = new NarrativeStore()
    bus = new NarrativeEventBus()
    const dispatcher = new UniverseDispatcher([new EngineerLens(), new CeremonyLens(), new StoryLens()])

    app = express.default()
    app.use(express.json())
    app.use("/api/health", createHealthRouter(store, [
      { name: "pde", version: "1.0.0", status: "ok" },
    ]))
    app.use("/api/narrative", createNarrativeRouter(dispatcher, store, bus))
    app.use("/api/sessions", createSessionRouter(store, bus))

    server = app.listen(0, () => {
      const addr = server.address() as { port: number }
      baseUrl = `http://127.0.0.1:${addr.port}`
      done()
    })
  })

  afterAll((done) => {
    server.close(done)
  })

  describe("GET /api/health", () => {
    it("should return health status", async () => {
      const res = await fetch(`${baseUrl}/api/health`)
      expect(res.status).toBe(200)
      const body = await res.json() as any
      expect(body.status).toBe("healthy")
      expect(body.uptime).toBeGreaterThanOrEqual(0)
      expect(body.modules).toHaveLength(1)
      expect(body.narrative).toBeDefined()
      expect(body.narrative.enginesAvailable).toContain("three-universe")
    })
  })

  describe("POST /api/narrative/beats", () => {
    it("should create a beat", async () => {
      const res = await fetch(`${baseUrl}/api/narrative/beats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: "First commit", type: "commit" }),
      })
      expect(res.status).toBe(201)
      const body = await res.json() as any
      expect(body.id).toBeDefined()
      expect(body.description).toBe("First commit")
      expect(body.type).toBe("commit")
    })

    it("should reject missing description", async () => {
      const res = await fetch(`${baseUrl}/api/narrative/beats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
      expect(res.status).toBe(400)
    })
  })

  describe("GET /api/narrative/beats", () => {
    it("should list beats", async () => {
      const res = await fetch(`${baseUrl}/api/narrative/beats`)
      expect(res.status).toBe(200)
      const body = await res.json() as any
      expect(Array.isArray(body)).toBe(true)
      expect(body.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe("POST /api/narrative/charts", () => {
    it("should create a chart", async () => {
      const res = await fetch(`${baseUrl}/api/narrative/charts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          desiredOutcome: "All tests pass",
          currentReality: "3 failing",
          actions: [{ title: "Fix auth test" }],
        }),
      })
      expect(res.status).toBe(201)
      const body = await res.json() as any
      expect(body.id).toBeDefined()
      expect(body.actions).toHaveLength(1)
    })

    it("should reject missing fields", async () => {
      const res = await fetch(`${baseUrl}/api/narrative/charts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "only title" }),
      })
      expect(res.status).toBe(400)
    })
  })

  describe("GET /api/narrative/charts", () => {
    it("should list charts", async () => {
      const res = await fetch(`${baseUrl}/api/narrative/charts`)
      expect(res.status).toBe(200)
      const body = await res.json() as any
      expect(Array.isArray(body)).toBe(true)
    })
  })

  describe("POST /api/sessions", () => {
    it("should create a session", async () => {
      const res = await fetch(`${baseUrl}/api/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ intent: "Build auth module" }),
      })
      expect(res.status).toBe(201)
      const body = await res.json() as any
      expect(body.id).toBeDefined()
      expect(body.intent).toBe("Build auth module")
      expect(body.phase).toBe("germination")
      expect(body.active).toBe(true)
    })
  })

  describe("GET /api/sessions", () => {
    it("should list sessions", async () => {
      const res = await fetch(`${baseUrl}/api/sessions`)
      expect(res.status).toBe(200)
      const body = await res.json() as any
      expect(Array.isArray(body)).toBe(true)
    })
  })

  describe("GET /api/sessions/current", () => {
    it("should return the active session", async () => {
      const res = await fetch(`${baseUrl}/api/sessions/current`)
      expect(res.status).toBe(200)
      const body = await res.json() as any
      expect(body.active).toBe(true)
    })
  })

  describe("POST /api/narrative/analyze", () => {
    it("should perform three-universe analysis", async () => {
      const res = await fetch(`${baseUrl}/api/narrative/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: "Refactor the authentication module to use JWT tokens" }),
      })
      expect(res.status).toBe(200)
      const body = await res.json() as any
      expect(body.synthesis).toBeDefined()
      expect(body.synthesis.coherenceScore).toBeGreaterThanOrEqual(0)
      expect(body.traceId).toBeDefined()
    })

    it("should reject missing text", async () => {
      const res = await fetch(`${baseUrl}/api/narrative/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })
      expect(res.status).toBe(400)
    })
  })

  describe("events are emitted", () => {
    it("should emit beat.created when creating a beat", async () => {
      const events: any[] = []
      bus.on("beat.created", (e: any) => events.push(e))

      await fetch(`${baseUrl}/api/narrative/beats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: "event test beat" }),
      })

      expect(events).toHaveLength(1)
      expect(events[0].type).toBe("beat.created")
    })
  })
})
