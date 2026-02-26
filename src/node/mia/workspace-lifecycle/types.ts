/**
 * Workspace Lifecycle Types
 *
 * Core data structures for the Workspace Lifecycle Engine.
 * Maps Fritz's creative process (Germination → Assimilation → Completion)
 * to the development pipeline (Task → Spec → Plan → Code → PR).
 *
 * Key insight: WorkspaceSpecification IS a Structural Tension Chart —
 * currentReality maps to STC's "Current Reality" and
 * desiredOutcome maps to STC's "Desired Outcome".
 */

// --- Creative Process Phases ---

export type CreativePhase = "germination" | "assimilation" | "completion"

export type WorkspacePhase = "task" | "spec" | "plan" | "code" | "validate" | "pr" | "complete"

export type WorkspaceStatus = "germinating" | "assimilating" | "completing" | "resolved" | "abandoned"

/** Maps workspace phases to Fritz's creative process phases */
export function phaseToCreativePhase(phase: WorkspacePhase): CreativePhase {
  switch (phase) {
    case "task":
    case "spec":
      return "germination"
    case "plan":
    case "code":
      return "assimilation"
    case "validate":
    case "pr":
    case "complete":
      return "completion"
  }
}

/** Maps creative phases to workspace status */
export function creativePhaseToStatus(phase: CreativePhase): WorkspaceStatus {
  switch (phase) {
    case "germination":
      return "germinating"
    case "assimilation":
      return "assimilating"
    case "completion":
      return "completing"
  }
}

// --- Task Definition ---

export type TaskSource = "natural-language" | "github-issue" | "pde-decomposition" | "stc-chart"

export interface TaskDefinition {
  description: string
  source: TaskSource
  sourceId?: string
  creativeIntent: string
  edits: TaskEdit[]
}

export interface TaskEdit {
  timestamp: string
  previousDescription: string
  newDescription: string
}

// --- Specification (Interactive Structural Tension Chart) ---

export interface WorkspaceSpecification {
  id: string
  version: number
  currentReality: SpecItem[]
  desiredOutcome: SpecItem[]
  generatedAt: string
  editHistory: SpecEdit[]
}

export interface SpecItem {
  id: string
  text: string
  order: number
  addedBy: "ai" | "user"
  confidence?: number
}

export type SpecEditOperation = "add" | "edit" | "remove" | "reorder"
export type SpecColumn = "currentReality" | "desiredOutcome"

export interface SpecEdit {
  timestamp: string
  operation: SpecEditOperation
  column: SpecColumn
  itemId: string
  previousValue?: string
  newValue?: string
}

// --- Implementation Plan ---

export interface ImplementationPlan {
  id: string
  version: number
  files: PlannedFileChange[]
  generatedAt: string
  editHistory: PlanEdit[]
}

export type FileOperation = "create" | "modify" | "delete"

export interface PlannedFileChange {
  id: string
  path: string
  operation: FileOperation
  actions: ActionItem[]
  order: number
  dependencies: string[]
}

export interface ActionItem {
  id: string
  description: string
  order: number
  completed: boolean
  addedBy: "ai" | "user"
}

export interface PlanEdit {
  timestamp: string
  type: "add_file" | "remove_file" | "edit_action" | "reorder"
  fileId?: string
  actionId?: string
  previousValue?: unknown
  newValue?: unknown
}

// --- Code Changes ---

export type CodeChangeStatus = "generating" | "generated" | "user-edited" | "accepted" | "rejected"

export interface CodeChange {
  fileId: string
  filePath: string
  operation: FileOperation
  diff: string
  newContent: string
  oldContent?: string
  status: CodeChangeStatus
}

// --- Narrative Arc ---

export interface NarrativeArc {
  creativePhase: CreativePhase
  beats: StoryBeat[]
  tensionLevel: number
  advancingPattern: boolean
}

export interface StoryBeat {
  timestamp: string
  phase: WorkspacePhase
  event: string
  narrativeText: string
}

// --- STC Bridge ---

export interface STCChart {
  id: string
  outcome: string
  reality: string
  actions: STCAction[]
  createdAt: string
  updatedAt: string
}

export interface STCAction {
  id: string
  title: string
  currentReality: string
  completed: boolean
  completedAt?: string
}

// --- Workspace Version ---

export interface WorkspaceVersion {
  id: string
  workspaceId: string
  timestamp: string
  phase: WorkspacePhase
  snapshot: string // JSON-serialized workspace state
  description: string
}

// --- The Workspace Entity ---

export interface Workspace {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  status: WorkspaceStatus
  phase: WorkspacePhase
  task: TaskDefinition
  spec?: WorkspaceSpecification
  plan?: ImplementationPlan
  codeChanges: CodeChange[]
  stcChartId?: string
  narrativeArc: NarrativeArc
  versionHistory: WorkspaceVersion[]
}

// --- API Request/Response Types ---

export interface CreateWorkspaceRequest {
  task: string
  source?: TaskSource
  sourceId?: string
  repository?: { owner: string; repo: string; branch?: string }
}

export interface ListWorkspacesQuery {
  status?: WorkspaceStatus
  phase?: WorkspacePhase
  limit?: number
  offset?: number
  sort?: "created" | "updated"
}

export interface AddSpecItemRequest {
  text: string
  column: SpecColumn
}

export interface EditSpecItemRequest {
  text: string
}

export interface AddPlanFileRequest {
  path: string
  operation: FileOperation
  actions: { description: string }[]
}

export interface EditPlanFileRequest {
  actions?: { description: string }[]
}

// --- Events ---

export type WorkspaceEventType =
  | "workspace:created"
  | "workspace:phase-changed"
  | "workspace:spec-updated"
  | "workspace:plan-updated"
  | "workspace:code-generated"
  | "workspace:completed"
  | "workspace:abandoned"

export interface WorkspaceEvent {
  type: WorkspaceEventType
  workspaceId: string
  timestamp: string
  data: unknown
}
