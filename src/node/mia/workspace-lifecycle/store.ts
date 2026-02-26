/**
 * WorkspaceStore — Filesystem-based workspace persistence
 *
 * Stores workspace state as JSON files in a configurable directory.
 * Each workspace gets its own file: {storePath}/{workspaceId}.json
 */

import * as fs from "fs"
import * as path from "path"
import { Workspace, ListWorkspacesQuery } from "./types"

export class WorkspaceStore {
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

  async save(workspace: Workspace): Promise<void> {
    const data = JSON.stringify(workspace, null, 2)
    await fs.promises.writeFile(this.filePath(workspace.id), data, "utf-8")
  }

  async get(id: string): Promise<Workspace | null> {
    const fp = this.filePath(id)
    if (!fs.existsSync(fp)) {
      return null
    }
    const data = await fs.promises.readFile(fp, "utf-8")
    return JSON.parse(data) as Workspace
  }

  async delete(id: string): Promise<boolean> {
    const fp = this.filePath(id)
    if (!fs.existsSync(fp)) {
      return false
    }
    await fs.promises.unlink(fp)
    return true
  }

  async list(query?: ListWorkspacesQuery): Promise<Workspace[]> {
    if (!fs.existsSync(this.storePath)) {
      return []
    }

    const files = await fs.promises.readdir(this.storePath)
    const jsonFiles = files.filter((f) => f.endsWith(".json"))

    let workspaces: Workspace[] = []
    for (const file of jsonFiles) {
      const data = await fs.promises.readFile(path.join(this.storePath, file), "utf-8")
      try {
        workspaces.push(JSON.parse(data) as Workspace)
      } catch {
        // Skip malformed files
      }
    }

    // Apply filters
    if (query?.status) {
      workspaces = workspaces.filter((w) => w.status === query.status)
    }
    if (query?.phase) {
      workspaces = workspaces.filter((w) => w.phase === query.phase)
    }

    // Sort
    const sortField = query?.sort === "updated" ? "updatedAt" : "createdAt"
    workspaces.sort((a, b) => new Date(b[sortField]).getTime() - new Date(a[sortField]).getTime())

    // Pagination
    const offset = query?.offset ?? 0
    const limit = query?.limit ?? 50
    return workspaces.slice(offset, offset + limit)
  }

  async exists(id: string): Promise<boolean> {
    return fs.existsSync(this.filePath(id))
  }
}
