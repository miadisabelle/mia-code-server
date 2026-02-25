# Structural Tension Charts

> Management of Structural Tension Charts (STC) based on Robert Fritz's creative process.

## Desired Outcome
Developers create and manage STCs that track the tension between desired outcomes and current reality for their projects, with each action step advancing them toward their creative vision.

## Current Reality
miaco and miadi-code both implement STC commands. Charts are stored as local files or in Redis.

## Structural Tension
The STC system itself embodies structural tension — the tool for managing creative tension becomes a core development practice.

---

## Components

### ChartManager
CRUD operations for structural tension charts.
- **Behavior:** Creates charts with `{ outcome: string, reality: string }`. Lists charts for workspace/session. Adds action steps with title and current reality description. Marks actions complete. Reviews chart progress showing tension resolution. Charts stored in workspace `.mia/stc/` directory as JSON.
- **Data:**
  ```typescript
  interface STCChart {
    id: string;
    outcome: string;
    reality: string;
    createdAt: string;
    updatedAt: string;
    actions: STCAction[];
    observations: STCObservation[];
    status: 'active' | 'resolved' | 'archived';
    metadata: { workspace?: string; session?: string };
  }
  interface STCAction {
    id: string;
    title: string;
    reality: string;
    completed: boolean;
    completedAt?: string;
    order: number;
  }
  interface STCObservation {
    id: string;
    text: string;
    timestamp: string;
    universe?: string;
  }
  ```

### ChartReviewer
Analyzes chart progress and tension dynamics.
- **Behavior:** Given a chart, calculates completion percentage, identifies stalled actions, suggests next steps based on structural tension analysis. Uses three-universe perspective: Engineer reviews technical feasibility, Ceremony reviews relational impact, Story reviews narrative coherence of the development path.

### ChartVisualizer
Renders chart as visual representation.
- **Behavior:** Generates ASCII art for terminal, SVG for web rendering, and Mermaid diagram for documentation. Shows outcome at top, reality at bottom, actions as progression steps between them. Completed actions shown differently from pending ones.

### STCFileSync
Synchronizes charts with STCGOAL.md, STCISSUE.md, STCMASTERY.md files.
- **Behavior:** Reads workspace `STCGOAL.md` as chart outcome, `STCISSUE.md` as current reality observations, `STCMASTERY.md` as mastery notes. Bidirectional sync — chart changes update files and file changes update chart. Uses miadi-code STC workspace pattern.

---

## Creative Advancement Scenario

**Creative Advancement Scenario**: Managing Feature Development with STC

**User Intent**: Track creative advancement toward a working feature
**Current Reality**: Feature requirements exist but implementation hasn't started
**Natural Progression Steps**:
  1. Developer creates STC: outcome "Working auth system", reality "No auth exists"
  2. Adds actions: "Design schema", "Implement routes", "Add tests"
  3. As each action completes, chart visualizes tension resolution
  4. Three-universe review validates technical, relational, and narrative quality
**Achieved Outcome**: Feature delivered with structural tension fully resolved
**Supporting Features**: `ChartManager`, `ChartReviewer`, `ChartVisualizer`
