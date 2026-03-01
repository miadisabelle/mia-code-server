/**
 * PDE (Prompt Decomposition Engine) Types
 *
 * Core data structures for decomposing natural language prompts into
 * structured, actionable components. Maps intents to the Four Directions
 * (Medicine Wheel) and builds dependency graphs for execution ordering.
 *
 * Key insight: DecompositionResult IS the germination artifact —
 * it transforms vague requests into precise action plans with
 * holistic directional balance.
 */

// --- Intent Types ---

export type IntentLayer = "primary" | "secondary" | "implicit"

export type ComplexityEstimate = "trivial" | "low" | "medium" | "high" | "very-high"

export interface Intent {
  id: string
  layer: IntentLayer
  description: string
  confidence: number // 0-1
  keywords: string[]
  complexity: ComplexityEstimate
}

// --- Action Types ---

export type ActionStatus = "pending" | "in-progress" | "completed" | "blocked"

export interface Action {
  id: string
  description: string
  intentId: string // Links back to the intent that generated this action
  status: ActionStatus
  order: number
  dependencies: string[] // Action IDs this depends on
  estimatedEffort: ComplexityEstimate
}

// --- Ambiguity Types ---

export type AmbiguityType = "vague-scope" | "conflicting-requirements" | "missing-context" | "undefined-term"

export interface Ambiguity {
  id: string
  type: AmbiguityType
  description: string
  relatedIntentIds: string[]
  suggestedClarification: string
}

// --- Four Directions (Medicine Wheel) Types ---

export type Direction = "north" | "east" | "south" | "west"

export interface DirectionMapping {
  intents: string[] // Intent descriptions mapped to this direction
  energy_level: number // 0-1, how much energy in this direction
  balance_note: string // Observation about balance
}

export interface FourDirections {
  north: DirectionMapping // Vision, Strategy, Big Picture
  east: DirectionMapping // New Beginnings, Innovation, Sunrise
  south: DirectionMapping // Trust, Community, Nurture
  west: DirectionMapping // Reflection, Completion, Integration
}

// --- Dependency Types ---

export interface Dependency {
  id: string
  fromActionId: string
  toActionId: string
  type: "requires" | "enhances" | "blocks"
}

export interface ExecutionGroup {
  level: number
  actionIds: string[]
}

export interface DependencyGraph {
  dependencies: Dependency[]
  executionOrder: ExecutionGroup[]
  hasCircularDependency: boolean
  circularPath?: string[] // Action IDs forming the cycle
}

// --- Decomposition Result ---

export interface DecompositionResult {
  id: string
  timestamp: string
  original_prompt: string
  primary_intents: Intent[]
  secondary_intents: Intent[]
  implicit_intents: Intent[]
  action_stack: Action[]
  ambiguities: Ambiguity[]
  four_directions: FourDirections
  dependency_graph: DependencyGraph
}

// --- Balance Advisory Types ---

export interface BalanceRecommendation {
  direction: Direction
  issue: "overweight" | "underweight" | "absent"
  energy_level: number
  suggestion: string
}

export interface BalanceReport {
  isBalanced: boolean
  dominantDirection: Direction | null
  weakestDirection: Direction | null
  recommendations: BalanceRecommendation[]
  overallHealth: number // 0-1, where 1 is perfectly balanced
}

// --- Store Query Types ---

export interface ListDecompositionsQuery {
  limit?: number
  offset?: number
}

export interface DecompositionSummary {
  id: string
  timestamp: string
  original_prompt: string
  intentCount: number
  actionCount: number
  dominantDirection: Direction | null
  isBalanced: boolean
}

// --- API Request/Response Types ---

export interface DecomposeRequest {
  prompt: string
}

export interface ExportMarkdownRequest {
  id: string
}

// --- Direction Keywords (for classification) ---

export const DIRECTION_KEYWORDS: Record<Direction, string[]> = {
  north: [
    "strategy",
    "vision",
    "architecture",
    "design",
    "plan",
    "roadmap",
    "goal",
    "objective",
    "big picture",
    "structure",
    "framework",
    "blueprint",
    "overview",
    "direction",
    "leadership",
  ],
  east: [
    "create",
    "build",
    "new",
    "innovation",
    "start",
    "begin",
    "launch",
    "prototype",
    "experiment",
    "explore",
    "discover",
    "fresh",
    "greenfield",
    "initial",
    "bootstrap",
  ],
  south: [
    "test",
    "validate",
    "trust",
    "community",
    "team",
    "collaborate",
    "review",
    "feedback",
    "support",
    "maintain",
    "care",
    "quality",
    "reliability",
    "documentation",
    "nurture",
  ],
  west: [
    "reflect",
    "refactor",
    "complete",
    "finish",
    "integrate",
    "consolidate",
    "clean",
    "optimize",
    "retrospective",
    "simplify",
    "sunset",
    "remove",
    "prune",
    "resolve",
    "close",
  ],
}

// --- Complexity Keywords (for estimation) ---

export const COMPLEXITY_KEYWORDS: Record<ComplexityEstimate, string[]> = {
  trivial: ["rename", "typo", "label", "comment", "log"],
  low: ["add", "update", "fix", "change", "move", "toggle"],
  medium: ["implement", "create", "build", "configure", "setup", "design"],
  high: ["architect", "integrate", "migrate", "overhaul", "redesign", "scale"],
  "very-high": ["rewrite", "platform", "distributed", "real-time", "machine learning", "security audit"],
}

// --- Workflow Generation Types (PDE 03) ---

export type UniverseAssignment = "engineer" | "ceremony" | "story"

export interface NarrativeBeat {
  template: string
  universe: UniverseAssignment
  phase: "setup" | "action" | "resolution"
}

export interface WorkflowStep {
  id: string
  name: string
  actionId: string
  description: string
  universe: UniverseAssignment
  operation: ActionMappingTarget
  narrativeBeat: NarrativeBeat
  dependencies: string[] // Step IDs
  concurrencyGroup: number
}

export type ActionMappingTarget =
  | "file-system"
  | "test-runner"
  | "three-universe-analysis"
  | "pr-workflow"
  | "build"
  | "code-generation"
  | "documentation"
  | "configuration"
  | "manual"

export interface ActionMapping {
  pattern: string
  target: ActionMappingTarget
  universe: UniverseAssignment
}

export interface WorkflowDefinition {
  id: string
  decompositionId: string
  name: string
  sessionIntent: string
  steps: WorkflowStep[]
  completionNarrative: string
  generatedAt: string
}

// --- Steerable Decomposition Types (PDE 05) ---

export type SteerablePhase = "initial" | "user-editing" | "regenerating" | "finalized"

export type EditableLayer = "primary" | "secondary" | "directions" | "actionStack" | "context"

export type EditOperation = "add" | "edit" | "remove" | "reorder"

export interface DecompositionEdit {
  timestamp: string
  layer: EditableLayer
  operation: EditOperation
  path: string
  previousValue: unknown
  newValue: unknown
}

export interface SteerableState {
  phase: SteerablePhase
  editHistory: DecompositionEdit[]
  stalenessMap: Record<EditableLayer, boolean>
  lockedLayers: EditableLayer[]
}

export interface SteerableDecomposition extends DecompositionResult {
  steerableState: SteerableState
}

export interface GerminationHealth {
  germinationTimeMs: number
  editCount: number
  directionBalance: number // 0-1
  intentClarity: number // 0-1 average confidence
  isStalled: boolean
  recommendation: "continue" | "transition-to-assimilation" | "rebalance" | "clarify-intents"
}

// --- Hedging Patterns (for implicit intent detection) ---

export const HEDGING_PATTERNS: string[] = [
  "maybe",
  "perhaps",
  "ideally",
  "it would be nice",
  "if possible",
  "could also",
  "might want",
  "should probably",
  "at some point",
  "eventually",
  "bonus",
  "nice to have",
  "stretch goal",
  "optionally",
  "when we get to it",
]
