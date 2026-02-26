/**
 * Workspace Lifecycle HTTP Routes
 *
 * Express router providing REST API for workspace lifecycle operations.
 * Designed as a standalone router that CAN be mounted in the mia-code-server
 * Express app but is also independently testable.
 */

import * as express from "express"
import { WorkspaceLifecycleEngine } from "./engine"
import {
  CreateWorkspaceRequest,
  AddSpecItemRequest,
  EditSpecItemRequest,
  SpecColumn,
} from "./types"

export function createWorkspaceRouter(engine: WorkspaceLifecycleEngine): express.Router {
  const router = express.Router()

  // --- Workspace CRUD ---

  /** POST /api/workspace/ — Create a new workspace */
  router.post("/", async (req, res) => {
    try {
      const body = req.body as CreateWorkspaceRequest
      if (!body.task || typeof body.task !== "string") {
        res.status(400).json({ error: "task is required and must be a string" })
      }
      const workspace = await engine.createWorkspace(body.task, body.source, body.sourceId)
      res.status(201).json(workspace)
    } catch (err) {
      res.status(500).json({ error: (err as Error).message })
    }
  })

  /** GET /api/workspace/ — List workspaces */
  router.get("/", async (req, res) => {
    try {
      const query = {
        status: req.query.status as string | undefined,
        phase: req.query.phase as string | undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset as string, 10) : undefined,
        sort: req.query.sort as "created" | "updated" | undefined,
      }
      const workspaces = await engine.listWorkspaces(query as any)
      res.json(workspaces)
    } catch (err) {
      res.status(500).json({ error: (err as Error).message })
    }
  })

  /** GET /api/workspace/:id — Get workspace details */
  router.get("/:id", async (req, res) => {
    try {
      const workspace = await engine.getWorkspace(req.params.id)
      if (!workspace) {
        res.status(404).json({ error: "Workspace not found" })
      }
      res.json(workspace)
    } catch (err) {
      res.status(500).json({ error: (err as Error).message })
    }
  })

  /** DELETE /api/workspace/:id — Delete workspace */
  router.delete("/:id", async (req, res) => {
    try {
      const deleted = await engine.deleteWorkspace(req.params.id)
      if (!deleted) {
        res.status(404).json({ error: "Workspace not found" })
      }
      res.status(204).send()
    } catch (err) {
      res.status(500).json({ error: (err as Error).message })
    }
  })

  // --- Task Operations ---

  /** PATCH /api/workspace/:id/task — Update task description */
  router.patch("/:id/task", async (req, res) => {
    try {
      const { description } = req.body
      if (!description || typeof description !== "string") {
        res.status(400).json({ error: "description is required" })
      }
      const workspace = await engine.updateTask(req.params.id, description)
      res.json(workspace)
    } catch (err) {
      const message = (err as Error).message
      if (message.includes("not found")) {
        res.status(404).json({ error: message })
      }
      res.status(500).json({ error: message })
    }
  })

  // --- Specification Operations ---

  /** POST /api/workspace/:id/phase/spec — Generate specification */
  router.post("/:id/phase/spec", async (req, res) => {
    try {
      const { currentReality, desiredOutcome } = req.body
      if (!Array.isArray(currentReality) || !Array.isArray(desiredOutcome)) {
        res.status(400).json({ error: "currentReality and desiredOutcome arrays required" })
      }
      const workspace = await engine.generateSpec(req.params.id, currentReality, desiredOutcome)
      res.json(workspace)
    } catch (err) {
      const message = (err as Error).message
      if (message.includes("not found")) {
        res.status(404).json({ error: message })
      }
      res.status(500).json({ error: message })
    }
  })

  /** POST /api/workspace/:id/spec/items — Add spec item */
  router.post("/:id/spec/items", async (req, res) => {
    try {
      const body = req.body as AddSpecItemRequest
      if (!body.text || !body.column) {
        res.status(400).json({ error: "text and column required" })
      }
      if (body.column !== "currentReality" && body.column !== "desiredOutcome") {
        res.status(400).json({ error: "column must be currentReality or desiredOutcome" })
      }
      const workspace = await engine.addSpecItem(req.params.id, body.column as SpecColumn, body.text)
      res.json(workspace)
    } catch (err) {
      const message = (err as Error).message
      if (message.includes("not found")) {
        res.status(404).json({ error: message })
      }
      res.status(400).json({ error: message })
    }
  })

  /** PATCH /api/workspace/:id/spec/items/:itemId — Edit spec item */
  router.patch("/:id/spec/items/:itemId", async (req, res) => {
    try {
      const body = req.body as EditSpecItemRequest
      if (!body.text) {
        res.status(400).json({ error: "text is required" })
      }
      const workspace = await engine.editSpecItem(req.params.id, req.params.itemId, body.text)
      res.json(workspace)
    } catch (err) {
      const message = (err as Error).message
      if (message.includes("not found")) {
        res.status(404).json({ error: message })
      }
      res.status(400).json({ error: message })
    }
  })

  /** DELETE /api/workspace/:id/spec/items/:itemId — Remove spec item */
  router.delete("/:id/spec/items/:itemId", async (req, res) => {
    try {
      const workspace = await engine.removeSpecItem(req.params.id, req.params.itemId)
      res.json(workspace)
    } catch (err) {
      const message = (err as Error).message
      if (message.includes("not found")) {
        res.status(404).json({ error: message })
      }
      res.status(400).json({ error: message })
    }
  })

  // --- Plan Operations ---

  /** POST /api/workspace/:id/phase/plan — Generate plan */
  router.post("/:id/phase/plan", async (req, res) => {
    try {
      const { files } = req.body
      if (!Array.isArray(files)) {
        res.status(400).json({ error: "files array required" })
      }
      const workspace = await engine.generatePlan(req.params.id, files)
      res.json(workspace)
    } catch (err) {
      const message = (err as Error).message
      if (message.includes("not found")) {
        res.status(404).json({ error: message })
      }
      res.status(400).json({ error: message })
    }
  })

  // --- Code Operations ---

  /** POST /api/workspace/:id/phase/code — Add code changes */
  router.post("/:id/phase/code", async (req, res) => {
    try {
      const { changes } = req.body
      if (!Array.isArray(changes)) {
        res.status(400).json({ error: "changes array required" })
      }
      const workspace = await engine.addCodeChanges(req.params.id, changes)
      res.json(workspace)
    } catch (err) {
      const message = (err as Error).message
      if (message.includes("not found")) {
        res.status(404).json({ error: message })
      }
      res.status(400).json({ error: message })
    }
  })

  // --- Phase Transitions ---

  /** POST /api/workspace/:id/phase/validate — Start validation */
  router.post("/:id/phase/validate", async (req, res) => {
    try {
      const workspace = await engine.startValidation(req.params.id)
      res.json(workspace)
    } catch (err) {
      const message = (err as Error).message
      if (message.includes("not found")) {
        res.status(404).json({ error: message })
      }
      res.status(400).json({ error: message })
    }
  })

  /** POST /api/workspace/:id/complete — Complete workspace */
  router.post("/:id/complete", async (req, res) => {
    try {
      const workspace = await engine.completeWorkspace(req.params.id)
      res.json(workspace)
    } catch (err) {
      const message = (err as Error).message
      if (message.includes("not found")) {
        res.status(404).json({ error: message })
      }
      res.status(500).json({ error: message })
    }
  })

  /** POST /api/workspace/:id/abandon — Abandon workspace */
  router.post("/:id/abandon", async (req, res) => {
    try {
      const workspace = await engine.abandonWorkspace(req.params.id)
      res.json(workspace)
    } catch (err) {
      const message = (err as Error).message
      if (message.includes("not found")) {
        res.status(404).json({ error: message })
      }
      res.status(500).json({ error: message })
    }
  })

  return router
}
