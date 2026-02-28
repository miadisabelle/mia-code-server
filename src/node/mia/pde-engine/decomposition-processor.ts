/**
 * DecompositionProcessor — Core PDE analysis engine
 *
 * Orchestrates the full decomposition pipeline:
 * 1. Intent extraction (primary, secondary, implicit)
 * 2. Action generation from intents
 * 3. Dependency mapping (DAG construction)
 * 4. Four Directions classification (Medicine Wheel)
 * 5. Ambiguity detection
 *
 * Results are persisted in the PDEStore and can be exported to markdown.
 */

import * as crypto from "crypto"
import { IntentExtractor, extractKeywords, estimateComplexity } from "./intent-extractor"
import { DependencyMapper } from "./dependency-mapper"
import { DirectionAnalyzer } from "./direction-analyzer"
import { BalanceAdvisor } from "./balance-advisor"
import { PDEStore } from "./store"
import {
  DecompositionResult,
  Intent,
  Action,
  Ambiguity,
  BalanceReport,
  DecompositionSummary,
} from "./types"

function generateId(): string {
  return crypto.randomUUID()
}

function generateActionId(): string {
  return `action-${crypto.randomUUID().slice(0, 8)}`
}

function generateAmbiguityId(): string {
  return `amb-${crypto.randomUUID().slice(0, 8)}`
}

export class DecompositionProcessor {
  private readonly store: PDEStore
  private readonly intentExtractor: IntentExtractor
  private readonly dependencyMapper: DependencyMapper
  private readonly directionAnalyzer: DirectionAnalyzer
  private readonly balanceAdvisor: BalanceAdvisor

  constructor(store: PDEStore) {
    this.store = store
    this.intentExtractor = new IntentExtractor()
    this.dependencyMapper = new DependencyMapper()
    this.directionAnalyzer = new DirectionAnalyzer()
    this.balanceAdvisor = new BalanceAdvisor()
  }

  /**
   * Decompose a natural language prompt into a full DecompositionResult.
   */
  async decompose(prompt: string): Promise<DecompositionResult> {
    // Step 1: Extract intents
    const { primary, secondary, implicit } = this.intentExtractor.extract(prompt)

    // Step 2: Generate actions from all intents
    const allIntents = [...primary, ...secondary, ...implicit]
    const actions = this.generateActions(allIntents)

    // Step 3: Build dependency graph
    const dependencyGraph = this.dependencyMapper.buildGraph(actions)

    // Step 4: Classify into Four Directions
    const fourDirections = this.directionAnalyzer.analyze(allIntents)

    // Step 5: Detect ambiguities
    const ambiguities = this.detectAmbiguities(prompt, primary, secondary)

    // Update action dependency references from the graph
    for (const dep of dependencyGraph.dependencies) {
      const action = actions.find((a) => a.id === dep.fromActionId)
      if (action && !action.dependencies.includes(dep.toActionId)) {
        action.dependencies.push(dep.toActionId)
      }
    }

    // Construct the result
    const result: DecompositionResult = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      original_prompt: prompt,
      primary_intents: primary,
      secondary_intents: secondary,
      implicit_intents: implicit,
      action_stack: actions,
      ambiguities,
      four_directions: fourDirections,
      dependency_graph: dependencyGraph,
    }

    // Persist
    await this.store.save(result)

    return result
  }

  /**
   * Retrieve a stored decomposition by ID.
   */
  async get(id: string): Promise<DecompositionResult | null> {
    return this.store.get(id)
  }

  /**
   * List stored decompositions as summaries.
   */
  async list(limit?: number, offset?: number): Promise<DecompositionSummary[]> {
    return this.store.list({ limit, offset })
  }

  /**
   * Delete a stored decomposition.
   */
  async delete(id: string): Promise<boolean> {
    return this.store.delete(id)
  }

  /**
   * Export a decomposition to markdown.
   */
  async exportMarkdown(id: string): Promise<string | null> {
    const result = await this.store.get(id)
    if (!result) {
      return null
    }
    return this.store.exportMarkdown(result)
  }

  /**
   * Assess the directional balance of a decomposition.
   */
  async assessBalance(id: string): Promise<BalanceReport | null> {
    const result = await this.store.get(id)
    if (!result) {
      return null
    }
    return this.balanceAdvisor.assess(result.four_directions)
  }

  // --- Private helpers ---

  /**
   * Generates concrete actions from extracted intents.
   * Each primary intent generates at least one action.
   * Secondary intents may generate supporting actions.
   */
  private generateActions(intents: Intent[]): Action[] {
    const actions: Action[] = []
    let order = 0

    for (const intent of intents) {
      // Skip implicit intents for action generation (they're aspirational)
      if (intent.layer === "implicit") {
        continue
      }

      actions.push({
        id: generateActionId(),
        description: intent.description,
        intentId: intent.id,
        status: "pending",
        order: order++,
        dependencies: [],
        estimatedEffort: estimateComplexity(intent.description),
      })
    }

    return actions
  }

  /**
   * Detects ambiguities in the decomposition.
   * Checks for vague scope, conflicting requirements, missing context, and undefined terms.
   */
  private detectAmbiguities(
    prompt: string,
    primaryIntents: Intent[],
    secondaryIntents: Intent[],
  ): Ambiguity[] {
    const ambiguities: Ambiguity[] = []

    // Check for vague scope: short prompts with no clear specifics
    if (prompt.split(/\s+/).length < 5 && primaryIntents.length <= 1) {
      ambiguities.push({
        id: generateAmbiguityId(),
        type: "vague-scope",
        description: "The prompt is very brief and may lack sufficient detail for accurate decomposition",
        relatedIntentIds: primaryIntents.map((i) => i.id),
        suggestedClarification: "Consider adding specific requirements, constraints, or expected outcomes",
      })
    }

    // Check for conflicting requirements: create + delete on same concept
    const allIntents = [...primaryIntents, ...secondaryIntents]
    const createIntents = allIntents.filter((i) => i.description.toLowerCase().includes("create"))
    const deleteIntents = allIntents.filter((i) => i.description.toLowerCase().includes("delete") || i.description.toLowerCase().includes("remove"))

    if (createIntents.length > 0 && deleteIntents.length > 0) {
      // Check if they share keywords (potential conflict)
      for (const create of createIntents) {
        for (const del of deleteIntents) {
          const createKw = new Set(extractKeywords(create.description))
          const deleteKw = extractKeywords(del.description)
          const overlap = deleteKw.filter((kw) => createKw.has(kw))
          if (overlap.length > 0) {
            ambiguities.push({
              id: generateAmbiguityId(),
              type: "conflicting-requirements",
              description: `Potential conflict: creating and removing related concepts (${overlap.join(", ")})`,
              relatedIntentIds: [create.id, del.id],
              suggestedClarification: "Clarify whether these are sequential operations or conflicting goals",
            })
          }
        }
      }
    }

    // Check for low-confidence primary intents (missing context)
    for (const intent of primaryIntents) {
      if (intent.confidence < 0.7) {
        ambiguities.push({
          id: generateAmbiguityId(),
          type: "missing-context",
          description: `Low confidence in primary intent: "${intent.description}"`,
          relatedIntentIds: [intent.id],
          suggestedClarification: "Provide more detail about the expected behavior and constraints",
        })
      }
    }

    return ambiguities
  }
}
