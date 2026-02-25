# Ceremony Lens (Ava)

> Relational accountability analysis through the ceremony universe.

## Desired Outcome
Development actions are examined through a ceremonial lens that considers relational impact, sacred pause, and accountability — ensuring technical progress honors the relationships between developers, users, and the code itself.

## Current Reality
miadi-code's ceremony lens exists as part of CLI prompt construction. Ceremony Spiral spec exists in Miadi rispecs.

## Structural Tension
Ceremony creates intentional space that prevents rushed technical decisions from damaging relational quality.

---

## Components

### CeremonyAnalyzer
Core analysis engine for relational accountability.
- **Behavior:** Analyzes input for: relational impact (how does this affect users, team, community), sacred pause (is there adequate reflection before action), accountability (are commitments honored, are impacts acknowledged), ceremony completion (are development rituals properly observed). Returns structured reflection.
- **Data:**
  ```typescript
  interface CeremonyAnalysis {
    universe: 'ceremony';
    persona: { name: string; tradition: string }; // Default: Ava
    reflection: string;
    score: number; // 0-100
    aspects: {
      relationalImpact: { assessment: string; score: number };
      sacredPause: { assessment: string; score: number };
      accountability: { assessment: string; score: number };
      ceremonyCompletion: { assessment: string; score: number };
    };
    blessings?: string[];   // Positive acknowledgments
    concerns?: string[];    // Relational concerns
    ritualSuggestions?: string[]; // Suggested ceremonial actions
  }
  ```

### CeremonyPromptBuilder
Constructs LLM prompts for ceremonial analysis.
- **Behavior:** Builds system prompt establishing Ava's ceremonial persona with K'é (kinship) awareness. Includes project's relational context (team agreements, community guidelines). Adapts depth based on action significance (commit vs. release vs. refactor).

### CeremonySpiralIntegration
Integrates with the Ceremony Spiral workflow pattern.
- **Behavior:** Maps development events to spiral stages: Intention → Gathering → Reflection → Action → Gratitude. Tracks which stage the current development cycle is in. Prompts ceremonial actions at stage transitions (e.g., gratitude after a successful deploy).

---

## Supporting Structures
- K'é (kinship) awareness from miadi-code ceremony patterns
- Ceremony Spiral from Miadi's `rispecs/Ceremony_Spiral_API.spec.md`
- Non-blocking — ceremony analysis is advisory, never blocking actions
