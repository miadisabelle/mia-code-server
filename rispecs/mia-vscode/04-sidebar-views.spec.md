# Sidebar Views

> Three-universe sidebar panels for navigation and management.

## Desired Outcome
Dedicated sidebar views provide tree-based navigation of narrative elements — charts, beats, sessions, and universe analyses — organized by the three-universe structure.

## Current Reality
No narrative sidebar views exist in VS Code.

## Structural Tension
Tree-based navigation enables rapid access to narrative context alongside code.

---

## Components

### UniverseExplorer
Tree view showing three-universe analysis history.
- **Behavior:** Three root nodes: Engineer (🔧), Ceremony (🌿), Story (📖). Under each: recent analyses grouped by file. Each analysis expandable to show details. Click navigates to analyzed file. Filter by date, file, significance.

### ChartExplorer
Tree view of STC charts and their action steps.
- **Behavior:** Root: list of active charts. Each chart expandable to show: outcome, current reality, action steps (with checkbox icons). Completed actions have checkmark. Right-click context menu: add action, complete action, review chart, archive chart. Drag-and-drop to reorder actions.

### BeatTimeline
Chronological tree view of story beats.
- **Behavior:** Beats grouped by session or day. Each beat shows type icon, description preview, significance indicator. Click opens beat detail in editor. Filter by type, universe, significance threshold.

### SessionExplorer
Tree view of development sessions.
- **Behavior:** Lists sessions with: start time, intent (if set), phase indicator, beat count, chart count. Click loads session detail. Resume option for recent sessions. Export session as narrative document.

---

## Supporting Structures
- VS Code Extension API: `TreeDataProvider`
- Views registered in `viewsContainers` contribution
- Tree data refreshed via WebSocket events
