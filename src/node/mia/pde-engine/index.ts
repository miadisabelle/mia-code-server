/**
 * PDE Engine Module — Public API
 *
 * Entry point for the Prompt Decomposition Engine.
 * Exports the full PDE pipeline: decomposition → workflow generation → steerable editing.
 */

// Core decomposition
export { DecompositionProcessor } from "./decomposition-processor"
export { IntentExtractor } from "./intent-extractor"
export { DependencyMapper } from "./dependency-mapper"
export { DirectionAnalyzer } from "./direction-analyzer"
export { BalanceAdvisor } from "./balance-advisor"
export { PDEStore } from "./store"

// Workflow generation (PDE 03)
export { WorkflowGenerator } from "./workflow-generator"
export { ActionMapper } from "./action-mapper"
export { NarrativeFramer } from "./narrative-framer"

// Steerable decomposition (PDE 05)
export { GerminationMetrics } from "./germination-metrics"
export { LayerRegenerator } from "./layer-regenerator"
export { DecompositionToWorkspace } from "./decomposition-to-workspace"

// HTTP routes
export { createPDERouter } from "./routes"

// All types
export * from "./types"
