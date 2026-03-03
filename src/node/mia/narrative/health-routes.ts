/**
 * Health Routes — Enhanced /api/health endpoint
 *
 * Module-aware health reporting. Returns server status, uptime,
 * version, registered modules, and narrative session/chart counts.
 *
 * Matches what mia-three-universe extension expects from /api/health.
 */

import * as express from "express"
import { commit } from "../../constants"
import { NarrativeStore } from "./store"

export interface HealthModule {
  name: string
  version: string
  status: "ok" | "degraded" | "unavailable"
}

export function createHealthRouter(store: NarrativeStore, modules: HealthModule[]): express.Router {
  const startTime = Date.now()
  const router = express.Router()

  router.get("/", (_req, res) => {
    const uptime = Math.floor((Date.now() - startTime) / 1000)
    const allOk = modules.every((m) => m.status === "ok")
    const anyDegraded = modules.some((m) => m.status === "degraded")

    res.json({
      status: allOk ? "healthy" : anyDegraded ? "degraded" : "unhealthy",
      uptime,
      version: commit,
      modules,
      narrative: {
        activeSessions: store.activeSessions,
        activeCharts: store.chartCount,
        totalBeats: store.beatCount,
        enginesAvailable: ["three-universe", "pde"],
      },
    })
  })

  return router
}
