# Agent Communication

> Inter-agent communication protocol for the three-universe agents.

## Desired Outcome
The three-universe agents (Mia/Engineer, Ava/Ceremony, Miette/Story) communicate through a structured protocol — sharing context, requesting analysis, and collaborating on coherence synthesis.

## Current Reality
No inter-agent communication exists. Each universe is independently processed.

## Structural Tension
Agent collaboration creates emergent understanding beyond individual analysis.

---

## Components

### AgentProtocol
Message protocol for inter-agent communication.
- **Data:**
  ```typescript
  interface AgentMessage {
    from: 'mia' | 'ava' | 'miette';
    to: 'mia' | 'ava' | 'miette' | 'all';
    type: 'analysis-request' | 'context-share' | 'coherence-bid' | 'insight';
    payload: unknown;
    correlationId: string;
    timestamp: number;
  }
  ```
- **Behavior:** Agents exchange messages through an in-process message bus. Messages are typed and correlated. Request-response pattern for analysis delegation. Broadcast for context sharing. All messages logged for narrative reconstruction.

### CoherenceNegotiation
Agents negotiate coherent interpretations.
- **Behavior:** When analysis results conflict across universes, agents negotiate: Engineer asserts technical facts, Ceremony asserts relational context, Story asserts narrative arc. Negotiation produces weighted synthesis. Negotiation record stored as part of analysis history.

### AgentMemory
Shared memory space for cross-agent context.
- **Behavior:** Short-term shared memory (current session context). Long-term shared memory (persistent cross-session patterns). Each agent can read all shared memory. Each agent can write to its own section. Memory organized by topic, file, and time.

---

## Supporting Structures
- In-process message bus (EventEmitter pattern)
- Message persistence in narrative memory store
- Debugging tools to inspect agent communication
