/**
 * Workspace Lifecycle Module — Public API
 *
 * Entry point for the workspace lifecycle engine module.
 * Exports all public types, the engine, store, router, and STC bridge.
 */

export { WorkspaceStore } from "./store"
export { WorkspaceLifecycleEngine } from "./engine"
export { createWorkspaceRouter } from "./routes"
export {
  createChartFromSpec,
  updateChartFromWorkspace,
  computeTensionLevel,
  isAdvancingPattern,
} from "./stc-bridge"
export * from "./types"
