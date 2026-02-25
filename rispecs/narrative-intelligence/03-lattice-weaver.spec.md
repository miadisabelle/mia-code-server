# Lattice Weaver

> Pattern recognition across temporal, semantic, and circular connections.

## Desired Outcome
The system discovers meaningful patterns across development events, narrative beats, and STC charts — revealing connections that developers might not consciously notice, deepening project understanding.

## Current Reality
Miadi has a "Narrative Lattice Weaver" concept for pattern recognition and echo detection. Not implemented in code.

## Structural Tension
Hidden patterns in development activity naturally surface when the right analysis lens is applied.

---

## Components

### PatternDetector
Identifies recurring patterns across narrative data.
- **Behavior:** Analyzes beats, charts, and memory entries for: temporal patterns (recurring events at similar intervals), semantic patterns (similar themes or concerns appearing), circular patterns (return to previously visited themes — "echoes"), and causal patterns (event A consistently precedes event B). Returns pattern descriptions with confidence scores.
- **Data:**
  ```typescript
  interface NarrativePattern {
    id: string;
    type: 'temporal' | 'semantic' | 'circular' | 'causal';
    description: string;
    confidence: number;
    instances: PatternInstance[];
    insight: string; // Human-readable pattern meaning
    recommendation?: string;
  }
  interface PatternInstance {
    timestamp: string;
    beatId?: string;
    chartId?: string;
    memoryKey?: string;
    context: string;
  }
  ```

### EchoDetector
Finds narrative echoes — themes that return transformed.
- **Behavior:** Identifies when current development activity echoes past activities. Uses semantic similarity to find connections. Distinguishes between: exact repetition (oscillating pattern — flag as concern), transformed echo (advancing pattern — highlight as growth), and thematic resonance (related but distinct — note as connection).

### ConnectionMapper
Maps connections between narrative elements.
- **Behavior:** Builds a graph of connections between beats, charts, files, and memory entries. Connections weighted by strength. Supports graph queries: "what connects to this file?", "what echoes this chart?", "what patterns involve this theme?". Graph visualizable as network diagram.

### InsightGenerator
Generates human-readable insights from patterns.
- **Behavior:** Uses story lens LLM to interpret detected patterns. Generates 1-2 sentence insights explaining what the pattern means for the project. Insights surfaced in agent panel and live story monitor.

---

## Supporting Structures
- Pattern detection runs as background analysis on new data
- Uses simple cosine similarity for semantic comparison (no external ML service)
- Connection graph stored in memory, rebuilt from narrative data
