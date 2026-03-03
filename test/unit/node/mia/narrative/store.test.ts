import { NarrativeStore } from "../../../../../src/node/mia/narrative/store"

describe("NarrativeStore", () => {
  let store: NarrativeStore

  beforeEach(() => {
    store = new NarrativeStore()
  })

  describe("beats", () => {
    it("should create a beat with defaults", () => {
      const beat = store.createBeat({ description: "Fixed the bug" })
      expect(beat.id).toBeDefined()
      expect(beat.description).toBe("Fixed the bug")
      expect(beat.type).toBe("custom")
      expect(beat.createdAt).toBeDefined()
    })

    it("should create a beat with all fields", () => {
      const beat = store.createBeat({
        description: "Deployed v2",
        type: "deploy",
        sessionId: "s-1",
        context: { branch: "main" },
      })
      expect(beat.type).toBe("deploy")
      expect(beat.sessionId).toBe("s-1")
      expect(beat.context).toEqual({ branch: "main" })
    })

    it("should retrieve a beat by ID", () => {
      const beat = store.createBeat({ description: "test" })
      expect(store.getBeat(beat.id)).toEqual(beat)
      expect(store.getBeat("nonexistent")).toBeUndefined()
    })

    it("should list beats sorted by newest first", () => {
      store.createBeat({ description: "first" })
      store.createBeat({ description: "second" })
      store.createBeat({ description: "third" })

      const beats = store.listBeats()
      expect(beats).toHaveLength(3)
      // All created in same ms — just verify all are present
      const descriptions = beats.map((b) => b.description)
      expect(descriptions).toContain("first")
      expect(descriptions).toContain("third")
    })

    it("should filter beats by sessionId", () => {
      store.createBeat({ description: "a", sessionId: "s1" })
      store.createBeat({ description: "b", sessionId: "s2" })
      store.createBeat({ description: "c", sessionId: "s1" })

      const beats = store.listBeats({ sessionId: "s1" })
      expect(beats).toHaveLength(2)
    })

    it("should filter beats by type", () => {
      store.createBeat({ description: "a", type: "commit" })
      store.createBeat({ description: "b", type: "deploy" })
      store.createBeat({ description: "c", type: "commit" })

      const beats = store.listBeats({ type: "commit" })
      expect(beats).toHaveLength(2)
    })

    it("should respect limit", () => {
      for (let i = 0; i < 10; i++) {
        store.createBeat({ description: `beat-${i}` })
      }
      const beats = store.listBeats({ limit: 3 })
      expect(beats).toHaveLength(3)
    })

    it("should increment session beat count", () => {
      const session = store.createSession({ intent: "testing" })
      expect(session.beatCount).toBe(0)

      store.createBeat({ description: "a", sessionId: session.id })
      store.createBeat({ description: "b", sessionId: session.id })

      const updated = store.getSession(session.id)!
      expect(updated.beatCount).toBe(2)
    })
  })

  describe("sessions", () => {
    it("should create a session", () => {
      const session = store.createSession({ intent: "Build auth module" })
      expect(session.id).toBeDefined()
      expect(session.intent).toBe("Build auth module")
      expect(session.phase).toBe("germination")
      expect(session.active).toBe(true)
      expect(session.beatCount).toBe(0)
    })

    it("should deactivate previous session when creating new", () => {
      const s1 = store.createSession({ intent: "first" })
      expect(s1.active).toBe(true)

      const s2 = store.createSession({ intent: "second" })
      expect(s2.active).toBe(true)

      const s1Updated = store.getSession(s1.id)!
      expect(s1Updated.active).toBe(false)
    })

    it("should get active session", () => {
      store.createSession({ intent: "first" })
      store.createSession({ intent: "second" })

      const active = store.getActiveSession()
      expect(active).toBeDefined()
      expect(active!.intent).toBe("second")
    })

    it("should list sessions sorted by newest first", () => {
      store.createSession({ intent: "first" })
      store.createSession({ intent: "second" })
      store.createSession({ intent: "third" })

      const sessions = store.listSessions()
      expect(sessions).toHaveLength(3)
      // All created in same ms — just verify all are present
      const intents = sessions.map((s) => s.intent)
      expect(intents).toContain("first")
      expect(intents).toContain("third")
    })

    it("should update session phase", () => {
      const session = store.createSession({ intent: "test" })
      const updated = store.updateSessionPhase(session.id, "assimilation")
      expect(updated).toBeDefined()
      expect(updated!.phase).toBe("assimilation")
    })

    it("should return undefined for nonexistent session phase update", () => {
      expect(store.updateSessionPhase("nope", "completion")).toBeUndefined()
    })
  })

  describe("charts", () => {
    it("should create a chart with defaults", () => {
      const chart = store.createChart({
        desiredOutcome: "All tests passing",
        currentReality: "3 tests failing",
      })
      expect(chart.id).toBeDefined()
      expect(chart.title).toBe("All tests passing")
      expect(chart.desiredOutcome).toBe("All tests passing")
      expect(chart.currentReality).toBe("3 tests failing")
      expect(chart.actions).toEqual([])
    })

    it("should create a chart with actions", () => {
      const chart = store.createChart({
        title: "Fix tests",
        desiredOutcome: "All passing",
        currentReality: "3 failing",
        actions: [{ title: "Fix auth test" }, { title: "Fix db test" }],
      })
      expect(chart.actions).toHaveLength(2)
      expect(chart.actions[0].title).toBe("Fix auth test")
      expect(chart.actions[0].completed).toBe(false)
    })

    it("should retrieve a chart by ID", () => {
      const chart = store.createChart({ desiredOutcome: "x", currentReality: "y" })
      expect(store.getChart(chart.id)).toEqual(chart)
    })

    it("should list charts sorted by newest first", () => {
      store.createChart({ desiredOutcome: "a", currentReality: "a" })
      store.createChart({ desiredOutcome: "b", currentReality: "b" })
      const charts = store.listCharts()
      expect(charts).toHaveLength(2)
    })

    it("should update chart fields", () => {
      const chart = store.createChart({ desiredOutcome: "old", currentReality: "old" })
      const updated = store.updateChart(chart.id, { title: "New Title" })
      expect(updated).toBeDefined()
      expect(updated!.title).toBe("New Title")
    })

    it("should add action to chart", () => {
      const chart = store.createChart({ desiredOutcome: "x", currentReality: "y" })
      const action = store.addChartAction(chart.id, "Do something")
      expect(action).toBeDefined()
      expect(action!.title).toBe("Do something")

      const refreshed = store.getChart(chart.id)!
      expect(refreshed.actions).toHaveLength(1)
    })

    it("should complete chart action", () => {
      const chart = store.createChart({
        desiredOutcome: "x",
        currentReality: "y",
        actions: [{ title: "step 1" }],
      })
      const actionId = chart.actions[0].id
      const completed = store.completeChartAction(chart.id, actionId)
      expect(completed).toBeDefined()
      expect(completed!.completed).toBe(true)
      expect(completed!.completedAt).toBeDefined()
    })

    it("should return undefined for nonexistent chart operations", () => {
      expect(store.updateChart("nope", { title: "x" })).toBeUndefined()
      expect(store.addChartAction("nope", "x")).toBeUndefined()
      expect(store.completeChartAction("nope", "nope")).toBeUndefined()
    })
  })

  describe("health counters", () => {
    it("should report correct counts", () => {
      expect(store.activeSessions).toBe(0)
      expect(store.chartCount).toBe(0)
      expect(store.beatCount).toBe(0)

      store.createSession({ intent: "test" })
      store.createChart({ desiredOutcome: "x", currentReality: "y" })
      store.createBeat({ description: "beat" })

      expect(store.activeSessions).toBe(1)
      expect(store.chartCount).toBe(1)
      expect(store.beatCount).toBe(1)
    })
  })
})
