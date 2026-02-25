# Telemetry Narrative

> Telemetry routed through the narrative system.

## Desired Outcome
VS Code telemetry events are optionally routed through the narrative system, transforming usage metrics into story beats and narrative insights rather than raw data points.

## Current Reality
VS Code has a telemetry system sending anonymous usage data. mia-vscode can redirect this.

## Structural Tension
Telemetry as narrative creates meaningful insights from usage data.

---

## Components

### TelemetryNarrativeRouter
Routes VS Code telemetry events through narrative processing.
- **Behavior:** Intercepts VS Code telemetry events. Transforms significant events into story beats (e.g., first use of a feature, error encounters, extension installations). Aggregates events into session narrative. All processing is local — no external telemetry sent by default. Opt-in for external narrative sharing.

### UsageInsightGenerator
Generates narrative insights from usage patterns.
- **Behavior:** Analyzes telemetry data locally to produce: most-used features as "character traits", common workflows as "recurring motifs", error patterns as "challenges faced", feature discovery as "plot developments". Insights shared in session summary.

---

## Supporting Structures
- Extends VS Code's telemetry channel
- All processing local by default (privacy-first)
- Opt-in external sharing with explicit consent
