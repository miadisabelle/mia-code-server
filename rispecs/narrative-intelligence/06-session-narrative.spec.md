# Session Narrative

> Treating each IDE session as a narrative arc.

## Desired Outcome
Each development session is understood as a narrative arc — with a beginning (session intent), middle (development work), and end (session summary) — enabling reflective development practice.

## Current Reality
miadi-code tracks sessions with persistence. No arc structure.

## Structural Tension
Bounded sessions with narrative structure create natural reflection points that improve creative development.

---

## Components

### SessionArcTracker
Tracks the narrative arc of a development session.
- **Behavior:** On session start, prompts for optional session intent ("What do you want to create today?"). Tracks development activity as session beats. Detects phase transitions (exploration → building → polishing). On session end, generates session summary with three-universe reflection. Summary stored in narrative memory.
- **Data:**
  ```typescript
  interface SessionArc {
    id: string;
    intent?: string;
    phase: 'opening' | 'exploration' | 'building' | 'polishing' | 'closing';
    beats: StoryBeat[];
    startedAt: string;
    endedAt?: string;
    summary?: SessionSummary;
    charts: STCChart[];
  }
  interface SessionSummary {
    narrative: string;
    achievements: string[];
    unresolved: string[];
    universeReflections: {
      engineer: string;
      ceremony: string;
      story: string;
    };
    coherenceScore: number;
  }
  ```

### PhaseDetector
Detects session phase transitions.
- **Behavior:** Analyzes activity patterns to detect phase: Opening (reading files, reviewing), Exploration (browsing, searching), Building (writing code, creating), Polishing (testing, documenting, refactoring), Closing (committing, wrapping up). Phase changes generate beats and optionally notify developer.

### SessionSummaryGenerator
Generates end-of-session narrative summary.
- **Behavior:** At session close (or on-demand), generates summary including: what was accomplished, what remains, three-universe reflections, and suggested next session intent. Uses story lens for narrative prose. Summary persisted in memory for session continuity.

---

## Supporting Structures
- Session intent optional — system works without it
- Phase detection uses heuristics (no ML required)
- Session summaries become context for future sessions
