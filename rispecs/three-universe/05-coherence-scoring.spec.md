# Coherence Scoring

> Three-universe voting and synthesis system.

## Desired Outcome
Analysis from all three universes is synthesized into a coherent score and summary that developers can act on — balancing technical, relational, and narrative perspectives.

## Current Reality
Miadi's coherence scoring exists as a concept in docs/kids but not as a working implementation.

## Structural Tension
Multiple perspectives need synthesis to provide actionable guidance without information overload.

---

## Components

### CoherenceCalculator
Weighted scoring across universes.
- **Behavior:** Takes three `LensOutput` scores (0-100 each). Applies configurable weights (default: engineer=40%, ceremony=30%, story=30%). Calculates weighted average. Identifies agreement zones (all scores within 15 points) and tension zones (any score differs by >30 points). Generates overall score and confidence.
- **Data:**
  ```typescript
  interface CoherenceScore {
    overall: number;
    confidence: number; // How much agreement between universes
    weights: { engineer: number; ceremony: number; story: number };
    scores: { engineer: number; ceremony: number; story: number };
    agreement: 'strong' | 'moderate' | 'tension';
    tensionPoints: TensionPoint[];
  }
  interface TensionPoint {
    between: [string, string]; // e.g., ['engineer', 'ceremony']
    description: string;
    scoreDiff: number;
    resolution?: string;
  }
  ```

### SynthesisGenerator
Generates human-readable synthesis from three analyses.
- **Behavior:** Combines the three analysis texts into a coherent summary. Highlights points of agreement. Explains tensions between perspectives. Provides actionable next steps. Format: 2-3 sentence summary, followed by key points, followed by suggestions.

### VotingSystem
Three-universe voting for decisions.
- **Behavior:** For binary decisions (should I merge? should I refactor?), each universe votes yes/no with confidence. Majority wins with explanations. Unanimous agreement highlighted as strong signal. Unanimous disagreement triggers deeper analysis prompt.

---

## Supporting Structures
- Weight configuration in `narrative.coherence.weights` config
- Tension threshold configurable (default: 30 point difference)
- History of coherence scores tracked for trend analysis
