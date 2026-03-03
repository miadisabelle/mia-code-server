import { NarrativeEventBus, NarrativeEvent } from "../../../../../src/node/mia/narrative/event-bus"

describe("NarrativeEventBus", () => {
  let bus: NarrativeEventBus

  beforeEach(() => {
    bus = new NarrativeEventBus()
  })

  describe("emit", () => {
    it("should create and return an event with correct fields", () => {
      const event = bus.emit("beat.created", { text: "hello" })
      expect(event.id).toBeDefined()
      expect(event.type).toBe("beat.created")
      expect(event.payload).toEqual({ text: "hello" })
      expect(event.timestamp).toBeDefined()
      expect(event.traceId).toBeDefined()
    })

    it("should include channel when provided", () => {
      const event = bus.emit("chart.progress", {}, "stc:abc")
      expect(event.channel).toBe("stc:abc")
    })

    it("should use provided traceId", () => {
      const event = bus.emit("analysis.complete", {}, undefined, "trace-123")
      expect(event.traceId).toBe("trace-123")
    })
  })

  describe("onEvent", () => {
    it("should notify subscribers of all events", () => {
      const received: NarrativeEvent[] = []
      bus.onEvent((e: NarrativeEvent) => received.push(e))

      bus.emit("beat.created", { a: 1 })
      bus.emit("analysis.complete", { b: 2 })

      expect(received).toHaveLength(2)
      expect(received[0].type).toBe("beat.created")
      expect(received[1].type).toBe("analysis.complete")
    })

    it("should return unsubscribe function", () => {
      const received: NarrativeEvent[] = []
      const unsub = bus.onEvent((e: NarrativeEvent) => received.push(e))

      bus.emit("beat.created", {})
      unsub()
      bus.emit("beat.created", {})

      expect(received).toHaveLength(1)
    })
  })

  describe("on (typed)", () => {
    it("should only notify for the subscribed event type", () => {
      const received: NarrativeEvent[] = []
      bus.on("beat.created", (e: NarrativeEvent) => received.push(e))

      bus.emit("beat.created", { a: 1 })
      bus.emit("analysis.complete", { b: 2 })

      expect(received).toHaveLength(1)
      expect(received[0].type).toBe("beat.created")
    })
  })

  describe("getRecentEvents", () => {
    it("should return all recent events when no sinceId", () => {
      bus.emit("beat.created", {})
      bus.emit("analysis.complete", {})
      bus.emit("session.phase", {})

      const events = bus.getRecentEvents()
      expect(events).toHaveLength(3)
    })

    it("should return events after sinceId", () => {
      const e1 = bus.emit("beat.created", {})
      bus.emit("analysis.complete", {})
      bus.emit("session.phase", {})

      const events = bus.getRecentEvents(e1.id)
      expect(events).toHaveLength(2)
      expect(events[0].type).toBe("analysis.complete")
    })

    it("should return all events if sinceId not found", () => {
      bus.emit("beat.created", {})
      bus.emit("analysis.complete", {})

      const events = bus.getRecentEvents("nonexistent-id")
      expect(events).toHaveLength(2)
    })
  })

  describe("eventCount", () => {
    it("should track the number of recent events", () => {
      expect(bus.eventCount).toBe(0)
      bus.emit("beat.created", {})
      bus.emit("beat.created", {})
      expect(bus.eventCount).toBe(2)
    })
  })
})
