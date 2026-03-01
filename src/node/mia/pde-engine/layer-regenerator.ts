/**
 * LayerRegenerator — Selective regeneration of decomposition layers
 *
 * When a user edits one layer (e.g., primary intents), downstream layers
 * become stale. This regenerator can selectively rebuild individual layers
 * while preserving locked layers and user-added items.
 *
 * Regeneration pipeline:
 * - primary → secondary, directions, actionStack may become stale
 * - secondary → actionStack, directions may become stale
 * - directions → (leaf layer, no downstream staleness)
 * - actionStack → (leaf layer, no downstream staleness)
 */

import {
  SteerableDecomposition,
  EditableLayer,
  Intent,
  Action,
} from "./types"
import { IntentExtractor, estimateComplexity } from "./intent-extractor"
import { DirectionAnalyzer } from "./direction-analyzer"
import * as crypto from "crypto"

function generateActionId(): string {
  return `action-${crypto.randomUUID().slice(0, 8)}`
}

/** Maps each layer to the layers that become stale when it changes */
const STALENESS_CASCADE: Record<EditableLayer, EditableLayer[]> = {
  primary: ["secondary", "directions", "actionStack"],
  secondary: ["directions", "actionStack"],
  directions: [],
  actionStack: [],
  context: ["primary", "secondary", "directions", "actionStack"],
}

export class LayerRegenerator {
  private readonly intentExtractor: IntentExtractor
  private readonly directionAnalyzer: DirectionAnalyzer

  constructor() {
    this.intentExtractor = new IntentExtractor()
    this.directionAnalyzer = new DirectionAnalyzer()
  }

  /**
   * Mark downstream layers as stale after an edit to the given layer.
   */
  markStale(decomposition: SteerableDecomposition, editedLayer: EditableLayer): SteerableDecomposition {
    const cascade = STALENESS_CASCADE[editedLayer]
    const updated = { ...decomposition }
    updated.steerableState = {
      ...updated.steerableState,
      stalenessMap: { ...updated.steerableState.stalenessMap },
    }

    for (const layer of cascade) {
      if (!updated.steerableState.lockedLayers.includes(layer)) {
        updated.steerableState.stalenessMap[layer] = true
      }
    }

    return updated
  }

  /**
   * Regenerate a specific layer of the decomposition.
   * Preserves user-added items and locked layers.
   */
  regenerateLayer(
    decomposition: SteerableDecomposition,
    layer: EditableLayer,
  ): SteerableDecomposition {
    // Cannot regenerate locked layers
    if (decomposition.steerableState.lockedLayers.includes(layer)) {
      return decomposition
    }

    let updated = { ...decomposition }

    switch (layer) {
      case "secondary":
        updated = this.regenerateSecondary(updated)
        break
      case "directions":
        updated = this.regenerateDirections(updated)
        break
      case "actionStack":
        updated = this.regenerateActionStack(updated)
        break
      case "primary":
        // Primary intents are user-driven; regeneration re-extracts from original prompt
        updated = this.regeneratePrimary(updated)
        break
      case "context":
        // Context is external; cannot regenerate
        break
    }

    // Clear staleness for the regenerated layer
    updated.steerableState = {
      ...updated.steerableState,
      stalenessMap: {
        ...updated.steerableState.stalenessMap,
        [layer]: false,
      },
    }

    return updated
  }

  /**
   * Get the list of layers that are currently stale.
   */
  getStaleLayers(decomposition: SteerableDecomposition): EditableLayer[] {
    return (Object.entries(decomposition.steerableState.stalenessMap) as [EditableLayer, boolean][])
      .filter(([, isStale]) => isStale)
      .map(([layer]) => layer)
  }

  // --- Private regeneration methods ---

  private regeneratePrimary(d: SteerableDecomposition): SteerableDecomposition {
    const { primary } = this.intentExtractor.extract(d.original_prompt)
    return { ...d, primary_intents: primary }
  }

  private regenerateSecondary(d: SteerableDecomposition): SteerableDecomposition {
    // Re-extract from prompt, keeping user-added secondary intents
    const { secondary } = this.intentExtractor.extract(d.original_prompt)

    // Merge: keep user-added items that don't already exist
    const existingUserIntents = d.secondary_intents.filter(
      (i) => (i as Intent & { addedBy?: string }).addedBy === "user",
    )
    const merged = [...secondary, ...existingUserIntents]

    return { ...d, secondary_intents: merged }
  }

  private regenerateDirections(d: SteerableDecomposition): SteerableDecomposition {
    const allIntents = [
      ...d.primary_intents,
      ...d.secondary_intents,
      ...d.implicit_intents,
    ]
    const fourDirections = this.directionAnalyzer.analyze(allIntents)
    return { ...d, four_directions: fourDirections }
  }

  private regenerateActionStack(d: SteerableDecomposition): SteerableDecomposition {
    const allIntents = [
      ...d.primary_intents,
      ...d.secondary_intents,
    ]

    // Generate new actions, preserving user-added actions
    const userActions = d.action_stack.filter(
      (a) => (a as Action & { addedBy?: string }).addedBy === "user",
    )

    let order = 0
    const newActions: Action[] = allIntents
      .filter((intent) => intent.layer !== "implicit")
      .map((intent) => ({
        id: generateActionId(),
        description: intent.description,
        intentId: intent.id,
        status: "pending" as const,
        order: order++,
        dependencies: [],
        estimatedEffort: estimateComplexity(intent.description),
      }))

    // Append user actions after generated ones
    for (const userAction of userActions) {
      newActions.push({ ...userAction, order: order++ })
    }

    return { ...d, action_stack: newActions }
  }
}
