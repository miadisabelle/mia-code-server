# Story Lens (Miette)

> Narrative coherence analysis through the story engine universe.

## Desired Outcome
Development work is understood as a narrative — with arc coherence, character consistency, thematic threading, and plot awareness — enabling developers to see their project's story unfolding.

## Current Reality
miadi-code's story lens exists in CLI prompt construction. Story generation exists in Miadi but "never worked satisfactorily."

## Structural Tension
Every project tells a story — the story lens makes that narrative visible and coherent.

---

## Components

### StoryAnalyzer
Core analysis engine for narrative coherence.
- **Behavior:** Analyzes input for: arc coherence (does this advance the project's story), character consistency (are personas and roles maintained), thematic threading (are project themes carried through), plot awareness (what narrative phase is the project in — germination, assimilation, completion). Returns structured narrative analysis.
- **Data:**
  ```typescript
  interface StoryAnalysis {
    universe: 'story';
    persona: { name: string; voice: string }; // Default: Miette
    narrative: string;
    score: number; // 0-100
    elements: {
      arcCoherence: { assessment: string; score: number; arc: string };
      characterConsistency: { assessment: string; score: number };
      thematicThreading: { assessment: string; score: number; themes: string[] };
      plotAwareness: { assessment: string; score: number; phase: string };
    };
    storyBeats?: StoryBeat[];  // Generated beats from this analysis
    foreshadowing?: string[];  // Anticipated future narrative developments
  }
  ```

### StoryPromptBuilder
Constructs LLM prompts for narrative analysis.
- **Behavior:** Builds system prompt establishing Miette's storytelling persona. Includes project narrative context (previous beats, active arcs, themes). Adapts analysis to code type (feature = rising action, bug fix = conflict resolution, refactor = character development).

### NarrativePhaseDetector
Detects the project's current narrative phase.
- **Behavior:** Analyzes project lifecycle signals (commit frequency, feature/bug ratio, documentation changes) to determine creative process phase: Germination (new ideas, exploration), Assimilation (building momentum, structure), Completion (finishing touches, polish). Phase influences story lens analysis tone.

---

## Supporting Structures
- NCP (Narrative Computing Protocol) from Miadi ecosystem
- Story beat generation feeds into `narrative-intelligence` module
- Phase detection uses git history analysis
