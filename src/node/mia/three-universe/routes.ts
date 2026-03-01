/**
 * Three-Universe HTTP Routes
 *
 * Express router exposing REST API for multi-perspective analysis.
 * Accepts text input and dispatches through Engineer, Ceremony, Story lenses.
 */

import * as express from "express"
import { UniverseDispatcher } from "./universe-dispatcher"
import { UniverseInput, UniverseName } from "./types"

export function createThreeUniverseRouter(dispatcher: UniverseDispatcher): express.Router {
  const router = express.Router()

  /** POST /api/three-universe/analyze — Run multi-universe analysis */
  router.post("/analyze", async (req, res) => {
    try {
      const body = req.body as Partial<UniverseInput>
      if (!body.text || typeof body.text !== "string") {
        res.status(400).json({ error: "text is required and must be a string" })
        return
      }

      const input: UniverseInput = {
        text: body.text,
        context: body.context ?? {},
        universes: body.universes ?? (["engineer", "ceremony", "story"] as UniverseName[]),
        options: body.options,
      }

      const result = await dispatcher.dispatch(input)
      res.json(result)
    } catch (err) {
      res.status(500).json({ error: (err as Error).message })
    }
  })

  /** GET /api/three-universe/health — Liveness check */
  router.get("/health", (_req, res) => {
    res.json({ status: "ok", lenses: ["engineer", "ceremony", "story"] })
  })

  return router
}
