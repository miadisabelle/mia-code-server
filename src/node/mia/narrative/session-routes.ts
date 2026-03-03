/**
 * Session Routes — /api/sessions REST endpoints
 *
 * Simple session tracking for narrative development sessions.
 * Matches what mia-vscode extensions expect.
 */

import * as express from "express"
import { NarrativeStore } from "./store"
import { NarrativeEventBus } from "./event-bus"
import { CreateSessionRequest } from "./types"

export function createSessionRouter(store: NarrativeStore, bus: NarrativeEventBus): express.Router {
  const router = express.Router()

  /** GET /api/sessions — List sessions */
  router.get("/", (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined
    res.json(store.listSessions(limit))
  })

  /** POST /api/sessions — Create a new session */
  router.post("/", (req, res) => {
    try {
      const body = req.body as Partial<CreateSessionRequest>
      if (!body.intent || typeof body.intent !== "string") {
        res.status(400).json({ error: "intent is required" })
        return
      }

      const session = store.createSession({ intent: body.intent })

      bus.emit("session.created", session)
      bus.emit("session.phase", { sessionId: session.id, phase: session.phase })

      res.status(201).json(session)
    } catch (err) {
      res.status(500).json({ error: (err as Error).message })
    }
  })

  /** GET /api/sessions/current — Get active session */
  router.get("/current", (_req, res) => {
    const session = store.getActiveSession()
    if (!session) {
      res.status(404).json({ error: "No active session" })
      return
    }
    res.json(session)
  })

  /** GET /api/sessions/:id — Get session by ID */
  router.get("/:id", (req, res) => {
    const session = store.getSession(req.params.id)
    if (!session) {
      res.status(404).json({ error: "Session not found" })
      return
    }
    res.json(session)
  })

  /** PATCH /api/sessions/:id/phase — Update session phase */
  router.patch("/:id/phase", (req, res) => {
    try {
      const { phase } = req.body
      if (!phase) {
        res.status(400).json({ error: "phase is required" })
        return
      }

      const session = store.updateSessionPhase(req.params.id, phase)
      if (!session) {
        res.status(404).json({ error: "Session not found" })
        return
      }

      bus.emit("session.phase", { sessionId: session.id, phase: session.phase })

      res.json(session)
    } catch (err) {
      res.status(500).json({ error: (err as Error).message })
    }
  })

  return router
}
