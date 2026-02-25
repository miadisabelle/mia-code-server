# Live Story Monitor

> Real-time narrative event dashboard transforming development into immersive story scenes.

## Desired Outcome
A real-time dashboard displays development events as they flow through the three-universe system — showing a live narrative of the development session as an unfolding story with visual richness.

## Current Reality
Miadi has a Live Story Monitor spec in `rispecs/live-story-monitor/`. Concept exists but implementation failed in the Miadi platform.

## Structural Tension
Seeing development as a live narrative creates engagement and awareness that pure metrics cannot achieve.

---

## Components

### StoryMonitorPanel
VS Code webview panel displaying live narrative stream.
- **Behavior:** Opens as a tab or split panel. Streams development events in real-time. Events rendered as story scenes with universe-colored annotations. Timeline view showing chronological progression. Filter by universe, event type, or significance. Auto-scroll with manual pause. Ambient mode with minimal UI for background monitoring.
- **Styling:** Dark theme with universe color accents. Smooth animations for new events. Significance affects visual prominence (larger text, glow effects for important beats). Timeline ribbons in three-universe colors.
- **Layout:** Contains `TimelineView`, `EventFeed`, `UniverseGauge`, `ChartOverview`

### EventFeed
Scrollable feed of narrative events.
- **Behavior:** Each event shows: timestamp, universe icons, narrative description, significance indicator, related file link. High-significance events expanded by default. Low-significance events collapsed to single line. Events grouped by time blocks (5-minute windows).

### UniverseGauge
Visual gauge showing universe balance.
- **Behavior:** Three-part circular gauge showing relative activity across universes. Updates in real-time as analyses complete. Highlights when one universe is underrepresented. Click reveals per-universe activity breakdown.

### ChartOverview
Mini-view of all active STC charts with live progress.
- **Behavior:** Shows all active charts as compact cards. Progress bars update in real-time. Completed actions animate briefly. Charts sorted by most recently updated.

---

## Supporting Structures
- WebSocket connection for real-time event streaming
- From Miadi's `rispecs/live-story-monitor/` specifications
- Ambient mode configurable for reduced distraction
