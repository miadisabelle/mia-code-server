/**
 * PDE Engine HTTP Routes
 *
 * Express router providing REST API for PDE decomposition operations.
 * Designed as a standalone router that CAN be mounted in the mia-code-server
 * Express app but is also independently testable.
 */

import * as express from "express"
import { DecompositionProcessor } from "./decomposition-processor"
import { DecomposeRequest } from "./types"

export function createPDERouter(processor: DecompositionProcessor): express.Router {
  const router = express.Router()

  /** POST /api/pde/decompose — Decompose a prompt */
  router.post("/decompose", async (req, res) => {
    try {
      const body = req.body as DecomposeRequest
      if (!body.prompt || typeof body.prompt !== "string") {
        res.status(400).json({ error: "prompt is required and must be a string" })
        return
      }
      const result = await processor.decompose(body.prompt)
      res.status(201).json(result)
    } catch (err) {
      res.status(500).json({ error: (err as Error).message })
    }
  })

  /** GET /api/pde/ — List decompositions */
  router.get("/", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined
      const offset = req.query.offset ? parseInt(req.query.offset as string, 10) : undefined
      const summaries = await processor.list(limit, offset)
      res.json(summaries)
    } catch (err) {
      res.status(500).json({ error: (err as Error).message })
    }
  })

  /** GET /api/pde/:id — Get a decomposition */
  router.get("/:id", async (req, res) => {
    try {
      const result = await processor.get(req.params.id)
      if (!result) {
        res.status(404).json({ error: "Decomposition not found" })
        return
      }
      res.json(result)
    } catch (err) {
      res.status(500).json({ error: (err as Error).message })
    }
  })

  /** DELETE /api/pde/:id — Delete a decomposition */
  router.delete("/:id", async (req, res) => {
    try {
      const deleted = await processor.delete(req.params.id)
      if (!deleted) {
        res.status(404).json({ error: "Decomposition not found" })
        return
      }
      res.status(204).send()
    } catch (err) {
      res.status(500).json({ error: (err as Error).message })
    }
  })

  /** GET /api/pde/:id/markdown — Export decomposition as markdown */
  router.get("/:id/markdown", async (req, res) => {
    try {
      const markdown = await processor.exportMarkdown(req.params.id)
      if (!markdown) {
        res.status(404).json({ error: "Decomposition not found" })
        return
      }
      res.type("text/markdown").send(markdown)
    } catch (err) {
      res.status(500).json({ error: (err as Error).message })
    }
  })

  /** GET /api/pde/:id/balance — Assess directional balance */
  router.get("/:id/balance", async (req, res) => {
    try {
      const report = await processor.assessBalance(req.params.id)
      if (!report) {
        res.status(404).json({ error: "Decomposition not found" })
        return
      }
      res.json(report)
    } catch (err) {
      res.status(500).json({ error: (err as Error).message })
    }
  })

  return router
}
