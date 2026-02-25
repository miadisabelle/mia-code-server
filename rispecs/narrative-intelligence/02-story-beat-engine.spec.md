# Story Beat Engine

> Automatic story beat generation from development events.

## Desired Outcome
Development events (commits, deployments, chart completions, significant analyses) automatically generate story beats — building a narrative record of the project's creative journey.

## Current Reality
miadi-code has `/beat` command for manual beat creation. Miadi platform has story beat generation that "never worked satisfactorily."

## Structural Tension
Development naturally generates story — the beat engine makes that implicit narrative explicit.

---

## Components

### BeatGenerator
Creates story beats from development events.
- **Behavior:** Listens to development events (commit, file save, chart action complete, analysis complete, deploy). Applies beat templates based on event type. Uses story lens for narrative enrichment. Generates beat with description, type, three-universe annotation, and narrative significance score. Low-significance events generate beats silently; high-significance beats surface in notifications.
- **Data:**
  ```typescript
  interface StoryBeat {
    id: string;
    type: 'inciting_incident' | 'rising_action' | 'climax' | 'falling_action' | 'resolution' | 'discovery' | 'challenge' | 'transformation';
    description: string;
    event: { type: string; source: string; data: Record<string, unknown> };
    universeAnnotations: {
      engineer?: string;
      ceremony?: string;
      story?: string;
    };
    significance: number; // 0-1
    session: string;
    workspace?: string;
    timestamp: string;
    relatedBeats?: string[]; // IDs of narratively connected beats
  }
  ```

### BeatTemplates
Templates for different event types.
- **Behavior:** Each event type has a beat template defining: beat type mapping, description template, significance calculation, and universe annotation prompts. Templates are extensible through configuration.
  - Commit → rising_action or resolution (based on commit message analysis)
  - Deploy → climax
  - Chart created → inciting_incident
  - Chart completed → resolution
  - Bug found → challenge
  - Refactor → transformation

### BeatNarrator
Enriches beats with narrative prose.
- **Behavior:** Uses story lens LLM to transform technical event data into narrative prose. Output is a 1-2 sentence narrative description that makes the beat readable as part of a story. Narrator aware of previous beats for continuity.

### BeatStore
Persistent storage for story beats.
- **Behavior:** Beats stored in narrative memory with `type: 'beat'`. Queryable by type, session, workspace, date range, significance threshold. Supports export as timeline, episode, or chronicle format.

---

## Supporting Structures
- Event subscription via module bus
- Significance threshold configurable to control beat volume
- Beat generation is async and non-blocking
