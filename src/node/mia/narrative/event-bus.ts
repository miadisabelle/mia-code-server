/**
 * NarrativeEventBus — Shared event system for narrative modules
 *
 * Central pub/sub for broadcasting narrative events across the server.
 * Used by WebSocket channel, narrative routes, and all mia modules.
 *
 * Event types match what mia-vscode extensions expect:
 * - beat.created, analysis.complete, session.phase
 * - coherence.update, chart.progress
 */

import { EventEmitter } from "events"
import * as crypto from "crypto"

export type NarrativeEventType =
  | "beat.created"
  | "analysis.complete"
  | "session.phase"
  | "coherence.update"
  | "chart.progress"
  | "chart.created"
  | "chart.updated"
  | "session.created"

export interface NarrativeEvent {
  id: string
  type: NarrativeEventType
  channel?: string
  payload: unknown
  timestamp: string
  traceId?: string
}

export class NarrativeEventBus {
  private readonly emitter = new EventEmitter()
  private readonly recentEvents: NarrativeEvent[] = []
  private readonly maxRecentEvents = 200

  constructor() {
    this.emitter.setMaxListeners(100)
  }

  /**
   * Emit a narrative event to all subscribers.
   */
  emit(type: NarrativeEventType, payload: unknown, channel?: string, traceId?: string): NarrativeEvent {
    const event: NarrativeEvent = {
      id: crypto.randomUUID(),
      type,
      channel,
      payload,
      timestamp: new Date().toISOString(),
      traceId: traceId ?? crypto.randomUUID(),
    }

    this.recentEvents.push(event)
    if (this.recentEvents.length > this.maxRecentEvents) {
      this.recentEvents.shift()
    }

    this.emitter.emit("narrative", event)
    this.emitter.emit(type, event)

    return event
  }

  /**
   * Subscribe to all narrative events.
   */
  onEvent(handler: (event: NarrativeEvent) => void): () => void {
    this.emitter.on("narrative", handler)
    return () => this.emitter.off("narrative", handler)
  }

  /**
   * Subscribe to a specific event type.
   */
  on(type: NarrativeEventType, handler: (event: NarrativeEvent) => void): () => void {
    this.emitter.on(type, handler)
    return () => this.emitter.off(type, handler)
  }

  /**
   * Get recent events, optionally since a given event ID (for replay).
   */
  getRecentEvents(sinceId?: string): NarrativeEvent[] {
    if (!sinceId) {
      return [...this.recentEvents]
    }

    const idx = this.recentEvents.findIndex((e) => e.id === sinceId)
    if (idx === -1) {
      return [...this.recentEvents]
    }
    return this.recentEvents.slice(idx + 1)
  }

  /**
   * Get count of recent events (for health reporting).
   */
  get eventCount(): number {
    return this.recentEvents.length
  }
}
