/**
 * DependencyMapper — Maps dependencies between extracted actions
 *
 * Analyzes the action stack for logical dependencies, creates a DAG
 * (Directed Acyclic Graph) of actions, identifies parallel execution
 * opportunities, detects circular dependencies, and generates
 * execution order recommendations.
 */

import * as crypto from "crypto"
import { Action, Dependency, DependencyGraph, ExecutionGroup } from "./types"

function generateDepId(): string {
  return `dep-${crypto.randomUUID().slice(0, 8)}`
}

/**
 * Keywords that imply an action depends on a prior action's output.
 * Maps from keyword → the kind of action it typically depends on.
 */
const DEPENDENCY_SIGNALS: Array<{ keyword: string; dependsOnKeywords: string[] }> = [
  { keyword: "test", dependsOnKeywords: ["create", "build", "implement", "setup"] },
  { keyword: "deploy", dependsOnKeywords: ["build", "test", "configure", "create"] },
  { keyword: "integrate", dependsOnKeywords: ["create", "build", "implement", "setup"] },
  { keyword: "configure", dependsOnKeywords: ["install", "setup", "create"] },
  { keyword: "validate", dependsOnKeywords: ["create", "build", "implement"] },
  { keyword: "review", dependsOnKeywords: ["create", "implement", "write"] },
  { keyword: "optimize", dependsOnKeywords: ["create", "build", "implement"] },
  { keyword: "refactor", dependsOnKeywords: ["create", "build", "implement"] },
  { keyword: "document", dependsOnKeywords: ["create", "build", "implement", "design"] },
  { keyword: "migrate", dependsOnKeywords: ["backup", "create", "setup"] },
]

export class DependencyMapper {
  /**
   * Analyzes actions and builds a complete dependency graph.
   */
  buildGraph(actions: Action[]): DependencyGraph {
    const dependencies = this.inferDependencies(actions)
    const hasCircular = this.detectCircularDependencies(actions, dependencies)

    let circularPath: string[] | undefined
    let executionOrder: ExecutionGroup[]

    if (hasCircular) {
      circularPath = this.findCircularPath(actions, dependencies)
      // Fallback to sequential ordering when circular deps detected
      executionOrder = actions.map((a, i) => ({ level: i, actionIds: [a.id] }))
    } else {
      executionOrder = this.computeExecutionOrder(actions, dependencies)
    }

    return {
      dependencies,
      executionOrder,
      hasCircularDependency: hasCircular,
      circularPath,
    }
  }

  /**
   * Infers dependencies between actions based on keyword analysis.
   * Actions whose descriptions match dependency signals are linked.
   */
  inferDependencies(actions: Action[]): Dependency[] {
    const dependencies: Dependency[] = []

    for (const action of actions) {
      const lower = action.description.toLowerCase()

      for (const signal of DEPENDENCY_SIGNALS) {
        if (!lower.includes(signal.keyword)) {
          continue
        }

        // Find actions this one likely depends on
        for (const candidate of actions) {
          if (candidate.id === action.id) {
            continue
          }
          const candidateLower = candidate.description.toLowerCase()
          const matches = signal.dependsOnKeywords.some((kw) => candidateLower.includes(kw))
          if (matches) {
            // Avoid duplicate dependencies
            const exists = dependencies.some(
              (d) => d.fromActionId === action.id && d.toActionId === candidate.id,
            )
            if (!exists) {
              dependencies.push({
                id: generateDepId(),
                fromActionId: action.id,
                toActionId: candidate.id,
                type: "requires",
              })
            }
          }
        }
      }

      // Also honor explicit dependencies from the action's dependency list
      for (const depId of action.dependencies) {
        const exists = dependencies.some(
          (d) => d.fromActionId === action.id && d.toActionId === depId,
        )
        if (!exists && actions.some((a) => a.id === depId)) {
          dependencies.push({
            id: generateDepId(),
            fromActionId: action.id,
            toActionId: depId,
            type: "requires",
          })
        }
      }
    }

    return dependencies
  }

  /**
   * Detects circular dependencies using depth-first search.
   */
  detectCircularDependencies(actions: Action[], dependencies: Dependency[]): boolean {
    const adjList = this.buildAdjacencyList(actions, dependencies)
    const visited = new Set<string>()
    const recursionStack = new Set<string>()

    for (const action of actions) {
      if (this.hasCycleDFS(action.id, adjList, visited, recursionStack)) {
        return true
      }
    }
    return false
  }

  /**
   * Finds the circular path if one exists (for error reporting).
   */
  findCircularPath(actions: Action[], dependencies: Dependency[]): string[] {
    const adjList = this.buildAdjacencyList(actions, dependencies)
    const visited = new Set<string>()
    const recursionStack = new Set<string>()
    const path: string[] = []

    for (const action of actions) {
      if (this.findCyclePath(action.id, adjList, visited, recursionStack, path)) {
        return path
      }
    }
    return []
  }

  /**
   * Computes execution order by topological sort (Kahn's algorithm).
   * Actions at the same level can be executed in parallel.
   */
  computeExecutionOrder(actions: Action[], dependencies: Dependency[]): ExecutionGroup[] {
    if (actions.length === 0) {
      return []
    }

    // Build in-degree map
    const inDegree = new Map<string, number>()
    const adjList = new Map<string, string[]>()

    for (const action of actions) {
      inDegree.set(action.id, 0)
      adjList.set(action.id, [])
    }

    for (const dep of dependencies) {
      // dep.fromActionId depends on dep.toActionId
      // So toActionId → fromActionId in the execution graph
      const current = inDegree.get(dep.fromActionId) ?? 0
      inDegree.set(dep.fromActionId, current + 1)

      const neighbors = adjList.get(dep.toActionId) ?? []
      neighbors.push(dep.fromActionId)
      adjList.set(dep.toActionId, neighbors)
    }

    // BFS-based topological sort with levels
    const groups: ExecutionGroup[] = []
    let queue = actions.filter((a) => (inDegree.get(a.id) ?? 0) === 0).map((a) => a.id)
    const processed = new Set<string>()
    let level = 0

    while (queue.length > 0) {
      groups.push({ level, actionIds: [...queue] })
      const nextQueue: string[] = []

      for (const nodeId of queue) {
        processed.add(nodeId)
        for (const neighbor of adjList.get(nodeId) ?? []) {
          const deg = (inDegree.get(neighbor) ?? 1) - 1
          inDegree.set(neighbor, deg)
          if (deg === 0 && !processed.has(neighbor)) {
            nextQueue.push(neighbor)
          }
        }
      }

      queue = nextQueue
      level++
    }

    // Any remaining actions not processed (shouldn't happen if no cycles)
    const remaining = actions.filter((a) => !processed.has(a.id))
    if (remaining.length > 0) {
      groups.push({ level, actionIds: remaining.map((a) => a.id) })
    }

    return groups
  }

  // --- Private helpers ---

  private buildAdjacencyList(
    actions: Action[],
    dependencies: Dependency[],
  ): Map<string, string[]> {
    const adjList = new Map<string, string[]>()

    for (const action of actions) {
      adjList.set(action.id, [])
    }

    for (const dep of dependencies) {
      // fromActionId depends on toActionId
      const neighbors = adjList.get(dep.fromActionId) ?? []
      neighbors.push(dep.toActionId)
      adjList.set(dep.fromActionId, neighbors)
    }

    return adjList
  }

  private hasCycleDFS(
    nodeId: string,
    adjList: Map<string, string[]>,
    visited: Set<string>,
    recursionStack: Set<string>,
  ): boolean {
    if (recursionStack.has(nodeId)) {
      return true
    }
    if (visited.has(nodeId)) {
      return false
    }

    visited.add(nodeId)
    recursionStack.add(nodeId)

    for (const neighbor of adjList.get(nodeId) ?? []) {
      if (this.hasCycleDFS(neighbor, adjList, visited, recursionStack)) {
        return true
      }
    }

    recursionStack.delete(nodeId)
    return false
  }

  private findCyclePath(
    nodeId: string,
    adjList: Map<string, string[]>,
    visited: Set<string>,
    recursionStack: Set<string>,
    path: string[],
  ): boolean {
    if (recursionStack.has(nodeId)) {
      path.push(nodeId)
      return true
    }
    if (visited.has(nodeId)) {
      return false
    }

    visited.add(nodeId)
    recursionStack.add(nodeId)
    path.push(nodeId)

    for (const neighbor of adjList.get(nodeId) ?? []) {
      if (this.findCyclePath(neighbor, adjList, visited, recursionStack, path)) {
        return true
      }
    }

    recursionStack.delete(nodeId)
    path.pop()
    return false
  }
}
