/**
 * PDEStore — Filesystem-based decomposition persistence
 *
 * Stores decomposition results as JSON files in a `.pde/` directory.
 * Each decomposition gets its own file: {storePath}/{id}.json
 *
 * Follows the same pattern as WorkspaceStore for consistency.
 */

import * as fs from "fs"
import * as path from "path"
import { DecompositionResult, DecompositionSummary, ListDecompositionsQuery, Direction } from "./types"

export class PDEStore {
  private readonly storePath: string

  constructor(storePath: string) {
    this.storePath = storePath
    if (!fs.existsSync(this.storePath)) {
      fs.mkdirSync(this.storePath, { recursive: true })
    }
  }

  private filePath(id: string): string {
    return path.join(this.storePath, `${id}.json`)
  }

  async save(result: DecompositionResult): Promise<void> {
    const data = JSON.stringify(result, null, 2)
    await fs.promises.writeFile(this.filePath(result.id), data, "utf-8")
  }

  async get(id: string): Promise<DecompositionResult | null> {
    const fp = this.filePath(id)
    if (!fs.existsSync(fp)) {
      return null
    }
    const data = await fs.promises.readFile(fp, "utf-8")
    return JSON.parse(data) as DecompositionResult
  }

  async delete(id: string): Promise<boolean> {
    const fp = this.filePath(id)
    if (!fs.existsSync(fp)) {
      return false
    }
    await fs.promises.unlink(fp)
    return true
  }

  async list(query?: ListDecompositionsQuery): Promise<DecompositionSummary[]> {
    if (!fs.existsSync(this.storePath)) {
      return []
    }

    const files = await fs.promises.readdir(this.storePath)
    const jsonFiles = files.filter((f) => f.endsWith(".json"))

    const summaries: DecompositionSummary[] = []
    for (const file of jsonFiles) {
      const data = await fs.promises.readFile(path.join(this.storePath, file), "utf-8")
      try {
        const result = JSON.parse(data) as DecompositionResult
        summaries.push(this.toSummary(result))
      } catch {
        // Skip malformed files
      }
    }

    // Sort by timestamp descending (most recent first)
    summaries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Pagination
    const offset = query?.offset ?? 0
    const limit = query?.limit ?? 50
    return summaries.slice(offset, offset + limit)
  }

  async exists(id: string): Promise<boolean> {
    return fs.existsSync(this.filePath(id))
  }

  /**
   * Exports a decomposition result as a markdown document.
   */
  exportMarkdown(result: DecompositionResult): string {
    const lines: string[] = []

    lines.push(`# Decomposition: ${result.original_prompt.slice(0, 80)}`)
    lines.push("")
    lines.push(`> ID: \`${result.id}\` | ${result.timestamp}`)
    lines.push("")

    // Primary Intents
    lines.push("## Primary Intents")
    for (const intent of result.primary_intents) {
      lines.push(`- **${intent.description}** (confidence: ${intent.confidence.toFixed(2)}, complexity: ${intent.complexity})`)
    }
    lines.push("")

    // Secondary Intents
    if (result.secondary_intents.length > 0) {
      lines.push("## Secondary Intents")
      for (const intent of result.secondary_intents) {
        lines.push(`- ${intent.description} (confidence: ${intent.confidence.toFixed(2)})`)
      }
      lines.push("")
    }

    // Implicit Intents
    if (result.implicit_intents.length > 0) {
      lines.push("## Implicit Intents")
      for (const intent of result.implicit_intents) {
        lines.push(`- _${intent.description}_ (confidence: ${intent.confidence.toFixed(2)})`)
      }
      lines.push("")
    }

    // Four Directions
    lines.push("## Four Directions")
    lines.push("")
    const dirLabels: Record<string, string> = {
      north: "🧭 North — Vision & Strategy",
      east: "🌅 East — Innovation & Creation",
      south: "🤝 South — Trust & Community",
      west: "🌙 West — Reflection & Integration",
    }
    const directions: Direction[] = ["north", "east", "south", "west"]
    for (const dir of directions) {
      const mapping = result.four_directions[dir]
      lines.push(`### ${dirLabels[dir]}`)
      lines.push(`Energy: ${(mapping.energy_level * 100).toFixed(0)}% | ${mapping.balance_note}`)
      if (mapping.intents.length > 0) {
        for (const intent of mapping.intents) {
          lines.push(`- ${intent}`)
        }
      } else {
        lines.push("- _(no intents in this direction)_")
      }
      lines.push("")
    }

    // Action Stack
    lines.push("## Action Stack")
    for (const action of result.action_stack) {
      const deps = action.dependencies.length > 0 ? ` (depends on: ${action.dependencies.join(", ")})` : ""
      lines.push(`${action.order + 1}. [ ] ${action.description}${deps}`)
    }
    lines.push("")

    // Ambiguities
    if (result.ambiguities.length > 0) {
      lines.push("## Ambiguities")
      for (const amb of result.ambiguities) {
        lines.push(`- **${amb.type}**: ${amb.description}`)
        lines.push(`  - Suggested clarification: ${amb.suggestedClarification}`)
      }
      lines.push("")
    }

    // Dependency Graph
    if (result.dependency_graph.dependencies.length > 0) {
      lines.push("## Dependencies")
      for (const dep of result.dependency_graph.dependencies) {
        lines.push(`- \`${dep.fromActionId}\` ${dep.type} \`${dep.toActionId}\``)
      }
      lines.push("")
    }

    if (result.dependency_graph.executionOrder.length > 0) {
      lines.push("## Execution Order")
      for (const group of result.dependency_graph.executionOrder) {
        lines.push(`**Level ${group.level}** (parallel): ${group.actionIds.join(", ")}`)
      }
      lines.push("")
    }

    return lines.join("\n")
  }

  private toSummary(result: DecompositionResult): DecompositionSummary {
    const directions: Direction[] = ["north", "east", "south", "west"]
    let dominantDirection: Direction | null = null
    let maxEnergy = 0

    for (const dir of directions) {
      if (result.four_directions[dir].energy_level > maxEnergy) {
        maxEnergy = result.four_directions[dir].energy_level
        dominantDirection = dir
      }
    }

    // Check balance: no direction > 50% of energy
    const isBalanced = directions.every((d) => result.four_directions[d].energy_level <= 0.5)

    return {
      id: result.id,
      timestamp: result.timestamp,
      original_prompt: result.original_prompt,
      intentCount:
        result.primary_intents.length + result.secondary_intents.length + result.implicit_intents.length,
      actionCount: result.action_stack.length,
      dominantDirection: maxEnergy > 0 ? dominantDirection : null,
      isBalanced,
    }
  }
}
