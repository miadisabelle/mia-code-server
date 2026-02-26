/**
 * STC Bridge — Maps workspace phases to Structural Tension Charts
 *
 * The workspace specification IS an STC:
 * - currentReality items → STC's "Current Reality"
 * - desiredOutcome items → STC's "Desired Outcome"
 * - plan action items → STC's "Action Steps"
 *
 * This bridge creates/updates STC charts from workspace state,
 * and computes tension levels.
 */

import {
  Workspace,
  STCChart,
  STCAction,
} from "./types"

let chartIdCounter = 0

function generateChartId(): string {
  return `stc-${Date.now()}-${++chartIdCounter}`
}

function generateActionId(): string {
  return `stc-action-${Date.now()}-${++chartIdCounter}`
}

/**
 * Creates an STC chart from a workspace's specification.
 * The spec's currentReality/desiredOutcome directly map to STC fields.
 */
export function createChartFromSpec(workspace: Workspace): STCChart | null {
  if (!workspace.spec) {
    return null
  }

  const spec = workspace.spec
  const now = new Date().toISOString()

  const outcome = spec.desiredOutcome.map((item) => item.text).join("\n- ")
  const reality = spec.currentReality.map((item) => item.text).join("\n- ")

  const actions: STCAction[] = []
  if (workspace.plan) {
    for (const file of workspace.plan.files) {
      for (const action of file.actions) {
        actions.push({
          id: generateActionId(),
          title: `${file.path}: ${action.description}`,
          currentReality: action.completed ? "Completed" : "Pending",
          completed: action.completed,
          completedAt: action.completed ? now : undefined,
        })
      }
    }
  }

  return {
    id: generateChartId(),
    outcome: outcome ? `- ${outcome}` : "",
    reality: reality ? `- ${reality}` : "",
    actions,
    createdAt: now,
    updatedAt: now,
  }
}

/**
 * Updates an existing STC chart from workspace state changes.
 */
export function updateChartFromWorkspace(chart: STCChart, workspace: Workspace): STCChart {
  const now = new Date().toISOString()

  if (workspace.spec) {
    chart.outcome = workspace.spec.desiredOutcome.map((item) => `- ${item.text}`).join("\n")
    chart.reality = workspace.spec.currentReality.map((item) => `- ${item.text}`).join("\n")
  }

  if (workspace.plan) {
    chart.actions = workspace.plan.files.flatMap((file) =>
      file.actions.map((action) => ({
        id: generateActionId(),
        title: `${file.path}: ${action.description}`,
        currentReality: action.completed ? "Completed" : "Pending",
        completed: action.completed,
        completedAt: action.completed ? now : undefined,
      })),
    )
  }

  chart.updatedAt = now
  return chart
}

/**
 * Computes tension level (0-1) based on how far the workspace is
 * from resolving the structural tension.
 *
 * Tension decreases as:
 * - More spec items are defined (clarity)
 * - More plan actions are completed
 * - Code changes are accepted
 */
export function computeTensionLevel(workspace: Workspace): number {
  let tension = 1.0

  // Spec clarity reduces tension slightly (germination progress)
  if (workspace.spec) {
    const specItemCount = workspace.spec.currentReality.length + workspace.spec.desiredOutcome.length
    if (specItemCount > 0) {
      tension -= 0.1 // Having a spec reduces tension by 10%
    }
  }

  // Plan existence reduces tension
  if (workspace.plan) {
    tension -= 0.1 // Having a plan reduces another 10%

    // Completed actions reduce tension proportionally
    const totalActions = workspace.plan.files.reduce((sum, f) => sum + f.actions.length, 0)
    if (totalActions > 0) {
      const completedActions = workspace.plan.files.reduce(
        (sum, f) => sum + f.actions.filter((a) => a.completed).length,
        0,
      )
      tension -= 0.4 * (completedActions / totalActions) // Up to 40% reduction from completed actions
    }
  }

  // Accepted code changes reduce tension
  if (workspace.codeChanges.length > 0) {
    const accepted = workspace.codeChanges.filter((c) => c.status === "accepted").length
    const total = workspace.codeChanges.length
    tension -= 0.3 * (accepted / total) // Up to 30% reduction from accepted code
  }

  // Completion = zero tension
  if (workspace.phase === "complete") {
    tension = 0
  }

  return Math.max(0, Math.min(1, tension))
}

/**
 * Determines if the workspace is following an advancing pattern
 * (steady progress) vs oscillating pattern (back-and-forth).
 */
export function isAdvancingPattern(workspace: Workspace): boolean {
  const beats = workspace.narrativeArc.beats
  if (beats.length < 3) {
    return true // Too early to tell, assume advancing
  }

  // Check last 5 beats for phase regression
  const recentBeats = beats.slice(-5)
  const phaseOrder: Record<string, number> = {
    task: 0,
    spec: 1,
    plan: 2,
    code: 3,
    validate: 4,
    pr: 5,
    complete: 6,
  }

  let regressions = 0
  for (let i = 1; i < recentBeats.length; i++) {
    if (phaseOrder[recentBeats[i].phase] < phaseOrder[recentBeats[i - 1].phase]) {
      regressions++
    }
  }

  // Half or more regressions = oscillating
  return regressions < (recentBeats.length - 1) / 2
}
