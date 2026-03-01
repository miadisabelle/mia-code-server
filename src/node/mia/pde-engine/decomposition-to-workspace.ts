/**
 * DecompositionToWorkspace — Bridges PDE output to Workspace Lifecycle creation
 *
 * Converts a finalized SteerableDecomposition into a Workspace seed:
 * - Primary intent → TaskDefinition
 * - East direction items → WorkspaceSpecification.desiredOutcome seeds
 * - South direction items → context for current reality
 * - Action stack → ImplementationPlan seed
 * - Four Directions balance → NarrativeArc.tensionLevel initial
 *
 * This is the critical bridge between pde-engine and workspace-lifecycle.
 */

import * as crypto from "crypto"
import { SteerableDecomposition } from "./types"
import {
  TaskDefinition,
  WorkspaceSpecification,
  ImplementationPlan,
  SpecItem,
  PlannedFileChange,
  NarrativeArc,
} from "../workspace-lifecycle/types"

function generateId(): string {
  return crypto.randomUUID()
}

function generateItemId(): string {
  return `item-${crypto.randomUUID().slice(0, 8)}`
}

export interface WorkspaceSeed {
  task: TaskDefinition
  spec: WorkspaceSpecification
  plan: ImplementationPlan
  narrativeArc: Partial<NarrativeArc>
}

export class DecompositionToWorkspace {
  /**
   * Convert a finalized SteerableDecomposition into a Workspace seed.
   * The decomposition should be in 'finalized' phase for best results,
   * but works with any phase.
   */
  finalize(decomposition: SteerableDecomposition): WorkspaceSeed {
    const task = this.buildTaskDefinition(decomposition)
    const spec = this.buildSpecification(decomposition)
    const plan = this.buildImplementationPlan(decomposition)
    const narrativeArc = this.buildNarrativeArc(decomposition)

    return { task, spec, plan, narrativeArc }
  }

  // --- Private builders ---

  private buildTaskDefinition(d: SteerableDecomposition): TaskDefinition {
    const primaryDescription = d.primary_intents.length > 0
      ? d.primary_intents.map((i) => i.description).join("; ")
      : d.original_prompt

    const creativeIntent = d.primary_intents.length > 0
      ? d.primary_intents[0].description
      : d.original_prompt.slice(0, 200)

    return {
      description: primaryDescription,
      source: "pde-decomposition",
      sourceId: d.id,
      creativeIntent,
      edits: [],
    }
  }

  private buildSpecification(d: SteerableDecomposition): WorkspaceSpecification {
    const now = new Date().toISOString()

    // East direction items become desired outcomes
    const desiredOutcome: SpecItem[] = d.four_directions.east.intents.map((intent, i) => ({
      id: generateItemId(),
      text: intent,
      order: i,
      addedBy: "ai" as const,
      confidence: 0.7,
    }))

    // If no east items, use primary intents as desired outcomes
    if (desiredOutcome.length === 0) {
      for (const intent of d.primary_intents) {
        desiredOutcome.push({
          id: generateItemId(),
          text: intent.description,
          order: desiredOutcome.length,
          addedBy: "ai" as const,
          confidence: intent.confidence,
        })
      }
    }

    // South direction items become current reality context
    const currentReality: SpecItem[] = d.four_directions.south.intents.map((intent, i) => ({
      id: generateItemId(),
      text: intent,
      order: i,
      addedBy: "ai" as const,
      confidence: 0.6,
    }))

    // West direction items also inform current reality (reflection on what exists)
    for (const intent of d.four_directions.west.intents) {
      currentReality.push({
        id: generateItemId(),
        text: intent,
        order: currentReality.length,
        addedBy: "ai" as const,
        confidence: 0.5,
      })
    }

    return {
      id: generateId(),
      version: 1,
      currentReality,
      desiredOutcome,
      generatedAt: now,
      editHistory: [],
    }
  }

  private buildImplementationPlan(d: SteerableDecomposition): ImplementationPlan {
    const now = new Date().toISOString()

    // Each action becomes a planned file change (abstract — path TBD)
    const files: PlannedFileChange[] = d.action_stack.map((action, i) => ({
      id: generateItemId(),
      path: `[to-be-determined]/${action.description.toLowerCase().replace(/\s+/g, "-").slice(0, 40)}`,
      operation: "create" as const,
      actions: [{
        id: generateItemId(),
        description: action.description,
        order: 0,
        completed: false,
        addedBy: "ai" as const,
      }],
      order: i,
      dependencies: action.dependencies,
    }))

    return {
      id: generateId(),
      version: 1,
      files,
      generatedAt: now,
      editHistory: [],
    }
  }

  private buildNarrativeArc(d: SteerableDecomposition): Partial<NarrativeArc> {
    // Compute initial tension level from directional balance
    const directions = ["north", "east", "south", "west"] as const
    const idealEnergy = 0.25
    let totalDeviation = 0

    for (const dir of directions) {
      totalDeviation += Math.abs(d.four_directions[dir].energy_level - idealEnergy)
    }

    // Higher tension when more imbalanced (structural tension drives the creative process)
    const tensionLevel = Math.min(1, totalDeviation / 1.5)

    return {
      creativePhase: "germination",
      tensionLevel,
      advancingPattern: tensionLevel > 0.3,
      beats: [],
    }
  }
}
