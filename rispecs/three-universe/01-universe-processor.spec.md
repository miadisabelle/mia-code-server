# Universe Processor

> Core processor dispatching all interactions through Engineer, Ceremony, and Story lenses.

## Desired Outcome
Every prompt, code change, and development event is processed through three interpretive universes — producing a synthesized response that balances technical precision, relational accountability, and narrative coherence.

## Current Reality
miadi-code implements a three-universe processor in its CLI. The processing is coupled to the terminal interface.

## Structural Tension
The three-universe analysis pattern is the platform's core differentiator — it must be a standalone, reusable component.

---

## Components

### UniverseDispatcher
Routes input to three parallel analysis paths.
- **Behavior:** Receives `{ input, context, universes }`. Dispatches to configured universe lenses in parallel. Awaits all results. Passes results to `CoherenceSynthesizer`. Returns unified response. Supports universe subset selection (e.g., only engineer + story). Timeout per-universe with graceful degradation.
- **Data:**
  ```typescript
  interface UniverseInput {
    text: string;
    context: {
      file?: string;
      language?: string;
      workspace?: string;
      session?: string;
      previousBeats?: StoryBeat[];
      activeCharts?: STCChart[];
    };
    universes: ('engineer' | 'ceremony' | 'story')[];
    options?: { timeout?: number; depth?: 'quick' | 'standard' | 'deep' };
  }
  interface UniverseOutput {
    engineer?: EngineerAnalysis;
    ceremony?: CeremonyAnalysis;
    story?: StoryAnalysis;
    synthesis: Synthesis;
    traceId: string;
    timing: { total: number; perUniverse: Record<string, number> };
  }
  ```

### LensInterface
Common interface for all universe lenses.
- **Behavior:** Each lens implements `analyze(input: LensInput): Promise<LensOutput>`. Lenses are stateless — context provided per-call. Lenses can be swapped or extended without affecting the dispatcher. Default implementations use LLM prompts; custom implementations can use rule-based analysis.
- **Data:**
  ```typescript
  interface UniverseLens {
    universe: 'engineer' | 'ceremony' | 'story';
    name: string;
    analyze(input: LensInput): Promise<LensOutput>;
  }
  interface LensInput {
    text: string;
    context: Record<string, unknown>;
    depth: 'quick' | 'standard' | 'deep';
  }
  interface LensOutput {
    universe: string;
    assessment: string;
    score: number;
    details: Record<string, unknown>;
    suggestions?: string[];
  }
  ```

### CoherenceSynthesizer
Combines three lens outputs into unified response.
- **Behavior:** Receives outputs from all active lenses. Calculates weighted coherence score. Identifies agreements and tensions between lenses. Generates synthesis narrative. Flags critical disagreements for developer attention.

---

## Supporting Structures
- Parallel execution using `Promise.allSettled` for fault tolerance
- Depth levels control LLM token budget and analysis thoroughness
- Results cached per-input hash for repeated analysis
