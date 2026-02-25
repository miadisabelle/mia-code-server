# Medicine Wheel Mapping

> Maps decomposed intents to Four Directions (Medicine Wheel).

## Desired Outcome
Decomposed prompts are mapped to the Four Directions — North (Vision/Strategy), East (New Beginnings/Innovation), South (Trust/Nurture), West (Reflection/Completion) — providing holistic context for action planning.

## Current Reality
PDE has basic four-direction mapping. No deep integration with development workflow.

## Structural Tension
Four-direction mapping ensures balanced action across vision, innovation, trust, and reflection.

---

## Components

### DirectionAnalyzer
Classifies intents and actions into Four Directions.
- **Data:**
  ```typescript
  interface FourDirections {
    north: DirectionMapping;  // Vision, Strategy, Big Picture
    east: DirectionMapping;   // New Beginnings, Innovation, Sunrise
    south: DirectionMapping;  // Trust, Community, Nurture
    west: DirectionMapping;   // Reflection, Completion, Integration
  }
  
  interface DirectionMapping {
    intents: string[];
    energy_level: number;     // 0-1, how much energy in this direction
    balance_note: string;     // Observation about balance
  }
  ```
- **Behavior:** Analyzes each intent for directional alignment. Computes energy distribution across directions. Identifies imbalances (e.g., all North/Strategy, no South/Community). Generates balance recommendations. Maps to STC chart suggestions.

### BalanceAdvisor
Advises on directional balance for project health.
- **Behavior:** When decomposition is heavily weighted in one direction, suggests balancing actions. Example: heavy East (innovation) with no West (reflection) → suggest retrospective. Balance check optional but recommended for large decompositions.

---

## Supporting Structures
- Directional analysis stored in DecompositionResult
- Visual representation in STC Dashboard
- Balance indicators in project health metrics
