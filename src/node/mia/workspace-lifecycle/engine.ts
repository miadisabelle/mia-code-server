/**
 * WorkspaceLifecycleEngine — Core engine managing workspace phase transitions
 *
 * Implements the creative development lifecycle:
 * - Germination: Task → Spec (establishing structural tension)
 * - Assimilation: Plan → Code (building through advancing patterns)
 * - Completion: Validate → PR → Complete (resolution)
 *
 * Each phase transition generates narrative beats and updates the STC bridge.
 */

import * as crypto from "crypto"
import { WorkspaceStore } from "./store"
import { createChartFromSpec, computeTensionLevel, isAdvancingPattern } from "./stc-bridge"
import {
  Workspace,
  WorkspacePhase,
  WorkspaceStatus,
  TaskSource,
  WorkspaceSpecification,
  SpecItem,
  SpecColumn,
  ImplementationPlan,
  FileOperation,
  CodeChange,
  StoryBeat,
  WorkspaceVersion,
  WorkspaceEvent,
  WorkspaceEventType,
  phaseToCreativePhase,
  creativePhaseToStatus,
} from "./types"

function generateId(): string {
  return crypto.randomUUID()
}

function generateItemId(): string {
  return `item-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

/** Valid phase transitions (forward and backward) — used for future validation */
export const VALID_TRANSITIONS: Record<WorkspacePhase, WorkspacePhase[]> = {
  task: ["spec"],
  spec: ["task", "plan"],
  plan: ["spec", "code"],
  code: ["plan", "validate"],
  validate: ["code", "pr"],
  pr: ["validate", "complete"],
  complete: [],
}

export type EventListener = (event: WorkspaceEvent) => void

export class WorkspaceLifecycleEngine {
  private readonly store: WorkspaceStore
  private listeners: EventListener[] = []

  constructor(store: WorkspaceStore) {
    this.store = store
  }

  /** Register an event listener */
  on(listener: EventListener): void {
    this.listeners.push(listener)
  }

  /** Remove an event listener */
  off(listener: EventListener): void {
    this.listeners = this.listeners.filter((l) => l !== listener)
  }

  private emit(type: WorkspaceEventType, workspaceId: string, data: unknown): void {
    const event: WorkspaceEvent = {
      type,
      workspaceId,
      timestamp: new Date().toISOString(),
      data,
    }
    for (const listener of this.listeners) {
      try {
        listener(event)
      } catch {
        // Don't let listener errors break the engine
      }
    }
  }

  /** Create a new workspace from a task description */
  async createWorkspace(
    taskDescription: string,
    source: TaskSource = "natural-language",
    sourceId?: string,
  ): Promise<Workspace> {
    const now = new Date().toISOString()
    const id = generateId()

    const workspace: Workspace = {
      id,
      title: taskDescription.slice(0, 100),
      createdAt: now,
      updatedAt: now,
      status: "germinating",
      phase: "task",
      task: {
        description: taskDescription,
        source,
        sourceId,
        creativeIntent: taskDescription, // Initially same as description
        edits: [],
      },
      codeChanges: [],
      narrativeArc: {
        creativePhase: "germination",
        beats: [
          {
            timestamp: now,
            phase: "task",
            event: "workspace:created",
            narrativeText: `A new creative workspace germinates: "${taskDescription.slice(0, 60)}..."`,
          },
        ],
        tensionLevel: 1.0, // Maximum tension at start
        advancingPattern: true,
      },
      versionHistory: [],
    }

    // Save initial version
    workspace.versionHistory.push(this.createVersion(workspace, "Workspace created"))
    await this.store.save(workspace)
    this.emit("workspace:created", id, { task: taskDescription })
    return workspace
  }

  /** Get a workspace by ID */
  async getWorkspace(id: string): Promise<Workspace | null> {
    return this.store.get(id)
  }

  /** List workspaces with optional filtering */
  async listWorkspaces(query?: {
    status?: WorkspaceStatus
    phase?: WorkspacePhase
    limit?: number
    offset?: number
    sort?: "created" | "updated"
  }): Promise<Workspace[]> {
    return this.store.list(query)
  }

  /** Update the task description (triggers re-germination) */
  async updateTask(workspaceId: string, newDescription: string): Promise<Workspace> {
    const workspace = await this.requireWorkspace(workspaceId)

    workspace.task.edits.push({
      timestamp: new Date().toISOString(),
      previousDescription: workspace.task.description,
      newDescription,
    })
    workspace.task.description = newDescription
    workspace.updatedAt = new Date().toISOString()

    this.addBeat(workspace, "task", "task:updated", `Task refined: "${newDescription.slice(0, 60)}..."`)

    workspace.versionHistory.push(this.createVersion(workspace, "Task updated"))
    await this.store.save(workspace)
    return workspace
  }

  /** Generate or replace the specification (interactive STC) */
  async generateSpec(
    workspaceId: string,
    currentReality: string[],
    desiredOutcome: string[],
  ): Promise<Workspace> {
    const workspace = await this.requireWorkspace(workspaceId)

    const now = new Date().toISOString()
    const spec: WorkspaceSpecification = {
      id: generateId(),
      version: workspace.spec ? workspace.spec.version + 1 : 1,
      currentReality: currentReality.map((text, i) => ({
        id: generateItemId(),
        text,
        order: i,
        addedBy: "ai" as const,
      })),
      desiredOutcome: desiredOutcome.map((text, i) => ({
        id: generateItemId(),
        text,
        order: i,
        addedBy: "ai" as const,
      })),
      generatedAt: now,
      editHistory: [],
    }

    workspace.spec = spec
    workspace.phase = "spec"
    workspace.status = creativePhaseToStatus(phaseToCreativePhase("spec"))
    workspace.updatedAt = now

    // Update narrative
    workspace.narrativeArc.creativePhase = "germination"
    workspace.narrativeArc.tensionLevel = computeTensionLevel(workspace)
    this.addBeat(
      workspace,
      "spec",
      "spec:generated",
      `Structural tension established: ${currentReality.length} reality items, ${desiredOutcome.length} desired outcomes`,
    )

    // Create STC chart
    const chart = createChartFromSpec(workspace)
    if (chart) {
      workspace.stcChartId = chart.id
    }

    workspace.versionHistory.push(this.createVersion(workspace, "Specification generated"))
    await this.store.save(workspace)
    this.emit("workspace:phase-changed", workspaceId, { phase: "spec" })
    return workspace
  }

  /** Add a spec item to currentReality or desiredOutcome */
  async addSpecItem(workspaceId: string, column: SpecColumn, text: string): Promise<Workspace> {
    const workspace = await this.requireWorkspace(workspaceId)
    if (!workspace.spec) {
      throw new Error("Workspace has no specification. Generate spec first.")
    }

    const items = workspace.spec[column]
    const newItem: SpecItem = {
      id: generateItemId(),
      text,
      order: items.length,
      addedBy: "user",
    }
    items.push(newItem)

    workspace.spec.editHistory.push({
      timestamp: new Date().toISOString(),
      operation: "add",
      column,
      itemId: newItem.id,
      newValue: text,
    })

    workspace.updatedAt = new Date().toISOString()
    workspace.narrativeArc.tensionLevel = computeTensionLevel(workspace)
    this.addBeat(workspace, "spec", "spec:item-added", `User adds to ${column}: "${text.slice(0, 50)}..."`)

    await this.store.save(workspace)
    this.emit("workspace:spec-updated", workspaceId, { column, text })
    return workspace
  }

  /** Edit an existing spec item */
  async editSpecItem(workspaceId: string, itemId: string, newText: string): Promise<Workspace> {
    const workspace = await this.requireWorkspace(workspaceId)
    if (!workspace.spec) {
      throw new Error("Workspace has no specification.")
    }

    let found = false
    for (const column of ["currentReality", "desiredOutcome"] as SpecColumn[]) {
      const item = workspace.spec[column].find((i) => i.id === itemId)
      if (item) {
        const previousValue = item.text
        item.text = newText
        item.addedBy = "user"

        workspace.spec.editHistory.push({
          timestamp: new Date().toISOString(),
          operation: "edit",
          column,
          itemId,
          previousValue,
          newValue: newText,
        })
        found = true
        break
      }
    }

    if (!found) {
      throw new Error(`Spec item ${itemId} not found.`)
    }

    workspace.updatedAt = new Date().toISOString()
    await this.store.save(workspace)
    this.emit("workspace:spec-updated", workspaceId, { itemId, newText })
    return workspace
  }

  /** Remove a spec item */
  async removeSpecItem(workspaceId: string, itemId: string): Promise<Workspace> {
    const workspace = await this.requireWorkspace(workspaceId)
    if (!workspace.spec) {
      throw new Error("Workspace has no specification.")
    }

    let found = false
    for (const column of ["currentReality", "desiredOutcome"] as SpecColumn[]) {
      const index = workspace.spec[column].findIndex((i) => i.id === itemId)
      if (index >= 0) {
        const removed = workspace.spec[column].splice(index, 1)[0]
        workspace.spec.editHistory.push({
          timestamp: new Date().toISOString(),
          operation: "remove",
          column,
          itemId,
          previousValue: removed.text,
        })
        found = true
        break
      }
    }

    if (!found) {
      throw new Error(`Spec item ${itemId} not found.`)
    }

    workspace.updatedAt = new Date().toISOString()
    await this.store.save(workspace)
    return workspace
  }

  /** Generate or replace the implementation plan */
  async generatePlan(
    workspaceId: string,
    files: Array<{ path: string; operation: FileOperation; actions: string[] }>,
  ): Promise<Workspace> {
    const workspace = await this.requireWorkspace(workspaceId)
    if (!workspace.spec) {
      throw new Error("Cannot generate plan without specification.")
    }

    const now = new Date().toISOString()
    const plan: ImplementationPlan = {
      id: generateId(),
      version: workspace.plan ? workspace.plan.version + 1 : 1,
      files: files.map((f, i) => ({
        id: generateItemId(),
        path: f.path,
        operation: f.operation,
        actions: f.actions.map((desc, j) => ({
          id: generateItemId(),
          description: desc,
          order: j,
          completed: false,
          addedBy: "ai" as const,
        })),
        order: i,
        dependencies: [],
      })),
      generatedAt: now,
      editHistory: [],
    }

    workspace.plan = plan
    workspace.phase = "plan"
    workspace.status = creativePhaseToStatus(phaseToCreativePhase("plan"))
    workspace.updatedAt = now

    workspace.narrativeArc.creativePhase = "assimilation"
    workspace.narrativeArc.tensionLevel = computeTensionLevel(workspace)
    this.addBeat(
      workspace,
      "plan",
      "plan:generated",
      `Implementation roadmap crystallizes: ${files.length} files, ${files.reduce((s, f) => s + f.actions.length, 0)} actions`,
    )

    workspace.versionHistory.push(this.createVersion(workspace, "Plan generated"))
    await this.store.save(workspace)
    this.emit("workspace:phase-changed", workspaceId, { phase: "plan" })
    return workspace
  }

  /** Add code changes for a workspace */
  async addCodeChanges(workspaceId: string, changes: CodeChange[]): Promise<Workspace> {
    const workspace = await this.requireWorkspace(workspaceId)
    if (!workspace.plan) {
      throw new Error("Cannot add code changes without a plan.")
    }

    workspace.codeChanges = changes
    workspace.phase = "code"
    workspace.status = creativePhaseToStatus(phaseToCreativePhase("code"))
    workspace.updatedAt = new Date().toISOString()

    workspace.narrativeArc.tensionLevel = computeTensionLevel(workspace)
    this.addBeat(
      workspace,
      "code",
      "code:generated",
      `Code manifests: ${changes.length} files changed through advancing patterns`,
    )

    workspace.versionHistory.push(this.createVersion(workspace, "Code generated"))
    await this.store.save(workspace)
    this.emit("workspace:code-generated", workspaceId, { fileCount: changes.length })
    return workspace
  }

  /** Advance to validation phase */
  async startValidation(workspaceId: string): Promise<Workspace> {
    const workspace = await this.requireWorkspace(workspaceId)
    if (workspace.codeChanges.length === 0) {
      throw new Error("No code changes to validate.")
    }

    workspace.phase = "validate"
    workspace.status = "completing"
    workspace.updatedAt = new Date().toISOString()

    workspace.narrativeArc.creativePhase = "completion"
    this.addBeat(workspace, "validate", "validation:started", "Validation confirms structural tension resolution")

    await this.store.save(workspace)
    this.emit("workspace:phase-changed", workspaceId, { phase: "validate" })
    return workspace
  }

  /** Complete the workspace */
  async completeWorkspace(workspaceId: string): Promise<Workspace> {
    const workspace = await this.requireWorkspace(workspaceId)

    workspace.phase = "complete"
    workspace.status = "resolved"
    workspace.updatedAt = new Date().toISOString()

    workspace.narrativeArc.creativePhase = "completion"
    workspace.narrativeArc.tensionLevel = 0
    workspace.narrativeArc.advancingPattern = isAdvancingPattern(workspace)
    this.addBeat(workspace, "complete", "workspace:completed", "Structural tension resolved — creation complete")

    workspace.versionHistory.push(this.createVersion(workspace, "Workspace completed"))
    await this.store.save(workspace)
    this.emit("workspace:completed", workspaceId, {})
    return workspace
  }

  /** Abandon the workspace */
  async abandonWorkspace(workspaceId: string): Promise<Workspace> {
    const workspace = await this.requireWorkspace(workspaceId)

    workspace.status = "abandoned"
    workspace.updatedAt = new Date().toISOString()

    this.addBeat(workspace, workspace.phase, "workspace:abandoned", "Creative journey paused — tension preserved for later")

    await this.store.save(workspace)
    this.emit("workspace:abandoned", workspaceId, {})
    return workspace
  }

  /** Delete a workspace */
  async deleteWorkspace(id: string): Promise<boolean> {
    return this.store.delete(id)
  }

  // --- Private helpers ---

  private async requireWorkspace(id: string): Promise<Workspace> {
    const workspace = await this.store.get(id)
    if (!workspace) {
      throw new Error(`Workspace ${id} not found.`)
    }
    return workspace
  }

  private addBeat(workspace: Workspace, phase: WorkspacePhase, event: string, narrativeText: string): void {
    const beat: StoryBeat = {
      timestamp: new Date().toISOString(),
      phase,
      event,
      narrativeText,
    }
    workspace.narrativeArc.beats.push(beat)
    workspace.narrativeArc.advancingPattern = isAdvancingPattern(workspace)
  }

  private createVersion(workspace: Workspace, description: string): WorkspaceVersion {
    // Create a snapshot without versionHistory to avoid recursion
    const { versionHistory, ...rest } = workspace
    return {
      id: generateId(),
      workspaceId: workspace.id,
      timestamp: new Date().toISOString(),
      phase: workspace.phase,
      snapshot: JSON.stringify(rest),
      description,
    }
  }
}
