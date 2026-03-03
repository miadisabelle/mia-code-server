/**
 * Narrative Routes — /api/narrative/* REST endpoints
 *
 * Exposes three-universe analysis, story beats, and STC charts
 * via RESTful HTTP endpoints. Matches the API surface expected
 * by mia-vscode extensions (httpClient.js).
 *
 * Also mounts /api/stc/charts as an alias for chart endpoints.
 */

import * as express from "express"
import { UniverseDispatcher } from "../three-universe"
import { UniverseInput, UniverseName } from "../three-universe/types"
import { NarrativeStore } from "./store"
import { NarrativeEventBus } from "./event-bus"
import { AnalysisRequest, CreateBeatRequest, CreateChartRequest, BeatType } from "./types"

export function createNarrativeRouter(
  dispatcher: UniverseDispatcher,
  store: NarrativeStore,
  bus: NarrativeEventBus,
): express.Router {
  const router = express.Router()

  // --- Analysis ---

  /** POST /api/narrative/analyze — Three-universe analysis */
  router.post("/analyze", async (req, res) => {
    try {
      const body = req.body as Partial<AnalysisRequest>
      if (!body.text || typeof body.text !== "string") {
        res.status(400).json({ error: "text is required" })
        return
      }

      const input: UniverseInput = {
        text: body.text,
        context: body.context ?? {},
        universes: (body.universes ?? ["engineer", "ceremony", "story"]) as UniverseName[],
        options: { depth: body.depth ?? "standard" },
      }

      const result = await dispatcher.dispatch(input)

      bus.emit("analysis.complete", {
        traceId: result.traceId,
        coherenceScore: result.synthesis.coherenceScore,
      })

      res.json(result)
    } catch (err) {
      res.status(500).json({ error: (err as Error).message })
    }
  })

  // --- Beats ---

  /** POST /api/narrative/beats — Create a story beat */
  router.post("/beats", (req, res) => {
    try {
      const body = req.body as Partial<CreateBeatRequest>
      if (!body.description || typeof body.description !== "string") {
        res.status(400).json({ error: "description is required" })
        return
      }

      const beat = store.createBeat({
        description: body.description,
        type: body.type as BeatType | undefined,
        sessionId: body.sessionId,
        context: body.context,
      })

      bus.emit("beat.created", beat, body.sessionId ? `beats:${body.sessionId}` : undefined)

      res.status(201).json(beat)
    } catch (err) {
      res.status(500).json({ error: (err as Error).message })
    }
  })

  /** GET /api/narrative/beats — List beats with optional filters */
  router.get("/beats", (req, res) => {
    try {
      const sessionId = req.query.sessionId as string | undefined
      const type = req.query.type as BeatType | undefined
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined

      const beats = store.listBeats({ sessionId, type, limit })
      res.json(beats)
    } catch (err) {
      res.status(500).json({ error: (err as Error).message })
    }
  })

  /** GET /api/narrative/beats/:id — Get a single beat */
  router.get("/beats/:id", (req, res) => {
    const beat = store.getBeat(req.params.id)
    if (!beat) {
      res.status(404).json({ error: "Beat not found" })
      return
    }
    res.json(beat)
  })

  // --- Charts (mounted here AND at /api/stc/charts) ---

  /** GET /api/narrative/charts — List all charts */
  router.get("/charts", (_req, res) => {
    res.json(store.listCharts())
  })

  /** POST /api/narrative/charts — Create a chart */
  router.post("/charts", (req, res) => {
    try {
      const body = req.body as Partial<CreateChartRequest>
      if (!body.desiredOutcome || !body.currentReality) {
        res.status(400).json({ error: "desiredOutcome and currentReality are required" })
        return
      }

      const chart = store.createChart({
        title: body.title,
        desiredOutcome: body.desiredOutcome,
        currentReality: body.currentReality,
        actions: body.actions,
      })

      bus.emit("chart.created", chart)

      res.status(201).json(chart)
    } catch (err) {
      res.status(500).json({ error: (err as Error).message })
    }
  })

  /** GET /api/narrative/charts/:id — Get chart details */
  router.get("/charts/:id", (req, res) => {
    const chart = store.getChart(req.params.id)
    if (!chart) {
      res.status(404).json({ error: "Chart not found" })
      return
    }
    res.json(chart)
  })

  /** PATCH /api/narrative/charts/:id — Update chart */
  router.patch("/charts/:id", (req, res) => {
    try {
      const chart = store.updateChart(req.params.id, req.body)
      if (!chart) {
        res.status(404).json({ error: "Chart not found" })
        return
      }

      bus.emit("chart.updated", chart, `stc:${chart.id}`)

      res.json(chart)
    } catch (err) {
      res.status(500).json({ error: (err as Error).message })
    }
  })

  /** POST /api/narrative/charts/:id/actions — Add action to chart */
  router.post("/charts/:id/actions", (req, res) => {
    try {
      const { title } = req.body
      if (!title) {
        res.status(400).json({ error: "title is required" })
        return
      }

      const action = store.addChartAction(req.params.id, title)
      if (!action) {
        res.status(404).json({ error: "Chart not found" })
        return
      }

      bus.emit("chart.progress", { chartId: req.params.id, action }, `stc:${req.params.id}`)

      res.status(201).json(action)
    } catch (err) {
      res.status(500).json({ error: (err as Error).message })
    }
  })

  /** PATCH /api/narrative/charts/:id/actions/:actionId — Complete action */
  router.patch("/charts/:id/actions/:actionId", (req, res) => {
    try {
      const action = store.completeChartAction(req.params.id, req.params.actionId)
      if (!action) {
        res.status(404).json({ error: "Chart or action not found" })
        return
      }

      bus.emit("chart.progress", {
        chartId: req.params.id,
        action,
        completed: true,
      }, `stc:${req.params.id}`)

      res.json(action)
    } catch (err) {
      res.status(500).json({ error: (err as Error).message })
    }
  })

  return router
}

/**
 * Standalone chart router for mounting at /api/stc/charts.
 * Provides the same chart endpoints but at the root level.
 */
export function createChartRouter(
  store: NarrativeStore,
  bus: NarrativeEventBus,
): express.Router {
  const router = express.Router()

  router.get("/", (_req, res) => {
    res.json(store.listCharts())
  })

  router.post("/", (req, res) => {
    try {
      const body = req.body as Partial<CreateChartRequest>
      if (!body.desiredOutcome || !body.currentReality) {
        res.status(400).json({ error: "desiredOutcome and currentReality are required" })
        return
      }
      const chart = store.createChart({
        title: body.title,
        desiredOutcome: body.desiredOutcome,
        currentReality: body.currentReality,
        actions: body.actions,
      })
      bus.emit("chart.created", chart)
      res.status(201).json(chart)
    } catch (err) {
      res.status(500).json({ error: (err as Error).message })
    }
  })

  router.get("/:id", (req, res) => {
    const chart = store.getChart(req.params.id)
    if (!chart) {
      res.status(404).json({ error: "Chart not found" })
      return
    }
    res.json(chart)
  })

  router.patch("/:id", (req, res) => {
    try {
      const chart = store.updateChart(req.params.id, req.body)
      if (!chart) {
        res.status(404).json({ error: "Chart not found" })
        return
      }
      bus.emit("chart.updated", chart, `stc:${chart.id}`)
      res.json(chart)
    } catch (err) {
      res.status(500).json({ error: (err as Error).message })
    }
  })

  return router
}
