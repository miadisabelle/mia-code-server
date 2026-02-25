# File Decorations

> File-level narrative annotations in the explorer and editor.

## Desired Outcome
Files in the explorer and editor tabs display narrative context — which universe most recently analyzed them, their narrative role (protagonist file, supporting file), and STC relevance — enabling developers to navigate by narrative significance.

## Current Reality
VS Code shows file type icons and git status decorations. No narrative decorations.

## Structural Tension
Narrative-aware file navigation enables developers to find files by creative significance, not just alphabetical order.

---

## Components

### FileDecorationProvider
VS Code file decoration provider for narrative context.
- **Behavior:** Implements `vscode.FileDecorationProvider`. Marks files with badges indicating: last analysis universe (🔧/🌿/📖), files referenced in active STC charts, files generating recent story beats. Badge color matches universe color scheme.
- **Data:**
  ```typescript
  interface NarrativeFileDecoration {
    uri: vscode.Uri;
    badge: string;     // Single character or emoji
    tooltip: string;   // Narrative context summary
    color: vscode.ThemeColor;
    propagate: boolean; // Whether to propagate to parent folders
  }
  ```

### NarrativeFileIndex
Index mapping files to their narrative significance.
- **Behavior:** Tracks which files are referenced in charts, beats, and analyses. Updates on analysis completion and chart changes. Provides `getNarrativeContext(uri)` for any file. Index stored in memory, rebuilt from session data on load.

### EditorTitleDecoration
Editor tab title enrichment.
- **Behavior:** Active editor tab shows small universe indicator next to filename. Tooltip on tab shows last analysis summary. Tab color tint follows dominant universe analysis.

---

## Supporting Structures
- VS Code Extension API: `vscode.FileDecorationProvider`
- Decorations are lightweight — no file system access needed
- Configurable decoration intensity (off/minimal/full)
