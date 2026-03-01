/**
 * WorkflowGenerator — Transforms PDE decompositions into executable workflows
 *
 * The bridge between analysis and execution: takes a DecompositionResult
 * and produces a WorkflowDefinition with steps grouped by dependency level,
 * universe assignments, and narrative framing.
 *
 * Output is structured data that can be serialized to YAML for execution
 * by the workflow engine (codevops-platform/02-workflow-engine.spec.md).
 */

import * as crypto from "crypto"
import {
  DecompositionResult,
  WorkflowDefinition,
  WorkflowStep,
} from "./types"
import { ActionMapper } from "./action-mapper"
import { NarrativeFramer } from "./narrative-framer"

function generateId(): string {
  return crypto.randomUUID()
}

function generateStepId(): string {
  return `step-${crypto.randomUUID().slice(0, 8)}`
}

export class WorkflowGenerator {
  private readonly actionMapper: ActionMapper
  private readonly narrativeFramer: NarrativeFramer

  constructor(actionMapper?: ActionMapper, narrativeFramer?: NarrativeFramer) {
    this.actionMapper = actionMapper ?? new ActionMapper()
    this.narrativeFramer = narrativeFramer ?? new NarrativeFramer()
  }

  /**
   * Generate a complete workflow definition from a decomposition result.
   */
  generate(decomposition: DecompositionResult): WorkflowDefinition {
    const { action_stack, dependency_graph, primary_intents } = decomposition

    // Map actions to platform operations
    const actionMappings = this.actionMapper.mapAll(action_stack)

    // Build steps from execution groups (respecting dependency ordering)
    const steps: WorkflowStep[] = []
    const actionIdToStepId = new Map<string, string>()

    // Pre-generate step IDs for dependency resolution
    for (const action of action_stack) {
      actionIdToStepId.set(action.id, generateStepId())
    }

    for (const group of dependency_graph.executionOrder) {
      for (const actionId of group.actionIds) {
        const action = action_stack.find((a) => a.id === actionId)
        if (!action) continue

        const mapping = actionMappings.get(actionId)
        const stepId = actionIdToStepId.get(actionId)
        if (!mapping || !stepId) continue

        // Resolve action dependencies to step IDs
        const stepDeps = action.dependencies
          .map((depActionId) => actionIdToStepId.get(depActionId))
          .filter((id): id is string => id !== undefined)

        const beat = this.narrativeFramer.generateBeat(action, mapping.universe)

        steps.push({
          id: stepId,
          name: this.generateStepName(action.description),
          actionId: action.id,
          description: action.description,
          universe: mapping.universe,
          operation: mapping.target,
          narrativeBeat: beat,
          dependencies: stepDeps,
          concurrencyGroup: group.level,
        })
      }
    }

    const sessionIntent = this.narrativeFramer.deriveSessionIntent(primary_intents)
    const completionNarrative = this.narrativeFramer.generateCompletionNarrative(
      primary_intents,
      steps.length,
    )

    return {
      id: generateId(),
      decompositionId: decomposition.id,
      name: this.generateWorkflowName(primary_intents),
      sessionIntent,
      steps,
      completionNarrative,
      generatedAt: new Date().toISOString(),
    }
  }

  /**
   * Export a workflow definition to YAML-compatible object.
   * Returns a plain object structure suitable for YAML serialization.
   */
  toYAMLObject(workflow: WorkflowDefinition): Record<string, unknown> {
    return {
      name: workflow.name,
      intent: workflow.sessionIntent,
      steps: workflow.steps.map((step) => ({
        id: step.id,
        name: step.name,
        description: step.description,
        universe: step.universe,
        operation: step.operation,
        depends_on: step.dependencies.length > 0 ? step.dependencies : undefined,
        concurrency_group: step.concurrencyGroup,
        narrative: step.narrativeBeat.template,
      })),
      completion: workflow.completionNarrative,
    }
  }

  // --- Private helpers ---

  private generateStepName(description: string): string {
    return description
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .trim()
      .split(/\s+/)
      .slice(0, 4)
      .join("-")
  }

  private generateWorkflowName(primaryIntents: { description: string }[]): string {
    if (primaryIntents.length === 0) {
      return "untitled-workflow"
    }
    return this.generateStepName(primaryIntents[0].description)
  }
}
