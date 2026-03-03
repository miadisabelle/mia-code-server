/**
 * Narrative Module — Public API
 *
 * Entry point for the narrative intelligence server module.
 * Exports event bus, store, all route factories, and types.
 */

export { NarrativeEventBus } from "./event-bus"
export type { NarrativeEvent, NarrativeEventType } from "./event-bus"
export { NarrativeStore } from "./store"
export { createHealthRouter } from "./health-routes"
export type { HealthModule } from "./health-routes"
export { createNarrativeRouter, createChartRouter } from "./narrative-routes"
export { createSessionRouter } from "./session-routes"
export { createNarrativeWsRouter } from "./ws-narrative"
export * from "./types"
