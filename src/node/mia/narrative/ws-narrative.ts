/**
 * Narrative WebSocket Router — /api/ws/narrative
 *
 * Real-time bidirectional WebSocket for narrative events.
 * Matches the protocol expected by mia-three-universe extension's
 * narrativeWebSocket.js client.
 *
 * Protocol:
 * - Client sends { type: 'auth', token } on connect
 * - Client sends { type: 'subscribe', channel: 'stc:chart_123' }
 * - Client sends { type: 'unsubscribe', channel: 'stc:chart_123' }
 * - Client sends { type: 'replay', since: lastEventId }
 * - Server pushes NarrativeEvent objects
 */

import Websocket from "ws"
import { wss, Router as WsRouter, WebsocketRouter } from "../../wsRouter"
import { NarrativeEventBus, NarrativeEvent } from "./event-bus"

export function createNarrativeWsRouter(bus: NarrativeEventBus): WebsocketRouter {
  const wsRouter = WsRouter()

  wsRouter.ws("/", async (req) => {
    wss.handleUpgrade(req, req.ws, req.head, (ws) => {
      const subscriptions = new Set<string>()
      let unsubscribe: (() => void) | null = null

      // Subscribe to the event bus and forward matching events to this client
      unsubscribe = bus.onEvent((event: NarrativeEvent) => {
        if (ws.readyState !== Websocket.OPEN) return

        // If client has subscriptions, only send matching events
        if (subscriptions.size > 0) {
          // Always send events with no channel (global)
          if (event.channel && !subscriptions.has(event.channel)) {
            // Also check for wildcard subscriptions (e.g., "stc:*" matches "stc:chart_123")
            const hasWildcard = Array.from(subscriptions).some((sub) => {
              if (sub.endsWith(":*")) {
                const prefix = sub.slice(0, -1)
                return event.channel!.startsWith(prefix)
              }
              return false
            })
            if (!hasWildcard) return
          }
        }

        try {
          ws.send(JSON.stringify(event))
        } catch {
          // Client disconnected
        }
      })

      ws.on("message", (data: Websocket.RawData) => {
        try {
          const msg = JSON.parse(data.toString())

          switch (msg.type) {
            case "auth": {
              // Accept any token for now (auth is handled by the HTTP layer cookie/session)
              ws.send(JSON.stringify({ type: "auth", status: "ok" }))
              break
            }

            case "subscribe": {
              if (msg.channel) {
                subscriptions.add(msg.channel)
                ws.send(JSON.stringify({ type: "subscribed", channel: msg.channel }))
              }
              break
            }

            case "unsubscribe": {
              if (msg.channel) {
                subscriptions.delete(msg.channel)
                ws.send(JSON.stringify({ type: "unsubscribed", channel: msg.channel }))
              }
              break
            }

            case "replay": {
              // Replay recent events since a given event ID
              const events = bus.getRecentEvents(msg.since)
              for (const event of events) {
                ws.send(JSON.stringify(event))
              }
              break
            }

            default: {
              ws.send(JSON.stringify({ type: "error", message: `Unknown message type: ${msg.type}` }))
            }
          }
        } catch {
          ws.send(JSON.stringify({ type: "error", message: "Invalid JSON" }))
        }
      })

      ws.on("close", () => {
        if (unsubscribe) {
          unsubscribe()
          unsubscribe = null
        }
        subscriptions.clear()
      })

      ws.on("error", () => {
        if (unsubscribe) {
          unsubscribe()
          unsubscribe = null
        }
        subscriptions.clear()
      })

      // Resume the paused socket
      req.ws.resume()
    })
  })

  return wsRouter
}
