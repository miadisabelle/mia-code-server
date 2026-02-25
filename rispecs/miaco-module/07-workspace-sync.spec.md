# Workspace Sync

> Synchronization of STC workspace files with narrative state.

## Desired Outcome
STCGOAL.md, STCISSUE.md, and STCMASTERY.md files in developer workspaces stay synchronized with the narrative intelligence system — enabling both file-based and API-based workflows for managing structural tension.

## Current Reality
miadi-code has STC workspace commands (`/stc config`, `/stc load`, `/stc sync`, `/stc commit`). Files are managed independently.

## Structural Tension
Developers who prefer file-based workflows need seamless integration with the server-side narrative system.

---

## Components

### WorkspaceWatcher
File system watcher for STC files.
- **Behavior:** Watches workspace directories for changes to `STCGOAL.md`, `STCISSUE.md`, `STCMASTERY.md`, and `.mia/stc/*.json` files. On change, triggers sync to narrative session. Debounces changes (1 second). Ignores changes made by the sync system itself to prevent loops.

### STCFileParser
Parses STC markdown files into structured data.
- **Behavior:** `STCGOAL.md` content becomes chart `outcome`. `STCISSUE.md` content becomes `observations`. `STCMASTERY.md` content becomes chart `metadata.mastery`. Markdown headings map to chart sections. Checkbox items map to action steps.
- **Data:**
  ```typescript
  interface STCFileContent {
    goal: { title: string; description: string; sections: Section[] };
    issue: { observations: string[]; currentReality: string };
    mastery: { insights: string[]; notes: string };
  }
  ```

### BidirectionalSync
Two-way sync between files and chart state.
- **Behavior:** File changes update chart state. Chart API changes update files. Conflict resolution: last-write-wins with merge for non-overlapping sections. Sync status visible in IDE status bar.

### WorkspaceMapping
Maps repositories to workspace paths.
- **Behavior:** Configuration maps `owner/repo` identifiers to local filesystem paths. Supports multiple workspace mappings. Auto-discovers workspaces from VS Code's open folders.

---

## Supporting Structures
- Uses Node.js `fs.watch` or `chokidar` for file watching
- Markdown parsing with standard library
- Sync state stored in `.mia/sync-state.json`
