/**
 * NarrativeStore — In-memory store for beats, sessions, and charts
 *
 * Simple in-memory storage for narrative data. Sufficient for the server
 * runtime; persistence can be added later via filesystem or database.
 */

import {
  StoryBeat,
  NarrativeSession,
  STCChart,
  STCAction,
  CreateBeatRequest,
  CreateSessionRequest,
  CreateChartRequest,
  BeatType,
  generateId,
} from "./types"

export class NarrativeStore {
  private readonly beats: Map<string, StoryBeat> = new Map()
  private readonly sessions: Map<string, NarrativeSession> = new Map()
  private readonly charts: Map<string, STCChart> = new Map()

  // --- Beats ---

  createBeat(req: CreateBeatRequest): StoryBeat {
    const beat: StoryBeat = {
      id: generateId(),
      description: req.description,
      type: req.type ?? "custom",
      sessionId: req.sessionId,
      context: req.context,
      createdAt: new Date().toISOString(),
    }
    this.beats.set(beat.id, beat)

    // Update session beat count
    if (beat.sessionId) {
      const session = this.sessions.get(beat.sessionId)
      if (session) {
        session.beatCount++
        session.updatedAt = new Date().toISOString()
      }
    }

    return beat
  }

  getBeat(id: string): StoryBeat | undefined {
    return this.beats.get(id)
  }

  listBeats(filters?: { sessionId?: string; type?: BeatType; limit?: number }): StoryBeat[] {
    let results = Array.from(this.beats.values())

    if (filters?.sessionId) {
      results = results.filter((b) => b.sessionId === filters.sessionId)
    }
    if (filters?.type) {
      results = results.filter((b) => b.type === filters.type)
    }

    results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    const limit = filters?.limit ?? 50
    return results.slice(0, limit)
  }

  // --- Sessions ---

  createSession(req: CreateSessionRequest): NarrativeSession {
    // Deactivate current active session
    for (const session of this.sessions.values()) {
      if (session.active) {
        session.active = false
        session.updatedAt = new Date().toISOString()
      }
    }

    const session: NarrativeSession = {
      id: generateId(),
      intent: req.intent,
      phase: "germination",
      startedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      beatCount: 0,
      active: true,
    }
    this.sessions.set(session.id, session)
    return session
  }

  getSession(id: string): NarrativeSession | undefined {
    return this.sessions.get(id)
  }

  getActiveSession(): NarrativeSession | undefined {
    return Array.from(this.sessions.values()).find((s) => s.active)
  }

  listSessions(limit?: number): NarrativeSession[] {
    const results = Array.from(this.sessions.values())
    results.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
    return results.slice(0, limit ?? 20)
  }

  updateSessionPhase(id: string, phase: NarrativeSession["phase"]): NarrativeSession | undefined {
    const session = this.sessions.get(id)
    if (!session) return undefined
    session.phase = phase
    session.updatedAt = new Date().toISOString()
    return session
  }

  // --- Charts ---

  createChart(req: CreateChartRequest): STCChart {
    const chart: STCChart = {
      id: generateId(),
      title: req.title ?? req.desiredOutcome.slice(0, 60),
      desiredOutcome: req.desiredOutcome,
      currentReality: req.currentReality,
      actions: (req.actions ?? []).map((a) => ({
        id: generateId(),
        title: a.title,
        completed: false,
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    this.charts.set(chart.id, chart)
    return chart
  }

  getChart(id: string): STCChart | undefined {
    return this.charts.get(id)
  }

  listCharts(): STCChart[] {
    return Array.from(this.charts.values())
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }

  updateChart(id: string, updates: Partial<Pick<STCChart, "title" | "desiredOutcome" | "currentReality">>): STCChart | undefined {
    const chart = this.charts.get(id)
    if (!chart) return undefined
    if (updates.title) chart.title = updates.title
    if (updates.desiredOutcome) chart.desiredOutcome = updates.desiredOutcome
    if (updates.currentReality) chart.currentReality = updates.currentReality
    chart.updatedAt = new Date().toISOString()
    return chart
  }

  addChartAction(chartId: string, title: string): STCAction | undefined {
    const chart = this.charts.get(chartId)
    if (!chart) return undefined
    const action: STCAction = {
      id: generateId(),
      title,
      completed: false,
    }
    chart.actions.push(action)
    chart.updatedAt = new Date().toISOString()
    return action
  }

  completeChartAction(chartId: string, actionId: string): STCAction | undefined {
    const chart = this.charts.get(chartId)
    if (!chart) return undefined
    const action = chart.actions.find((a) => a.id === actionId)
    if (!action) return undefined
    action.completed = true
    action.completedAt = new Date().toISOString()
    chart.updatedAt = new Date().toISOString()
    return action
  }

  // --- Health ---

  get activeSessions(): number {
    return Array.from(this.sessions.values()).filter((s) => s.active).length
  }

  get chartCount(): number {
    return this.charts.size
  }

  get beatCount(): number {
    return this.beats.size
  }
}
