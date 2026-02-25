# Activity Bar

> Custom activity bar with Three-Universe navigation icons.

## Desired Outcome
The VS Code activity bar includes dedicated icons for Three-Universe panels, STC Dashboard, and Live Story Monitor — giving narrative features first-class navigation alongside files, search, and extensions.

## Current Reality
VS Code activity bar has standard icons (files, search, source control, extensions, etc.).

## Structural Tension
First-class navigation for narrative tools makes them as accessible as file browsing.

---

## Components

### ThreeUniverseActivity
Activity bar icon for the Three-Universe panel.
- **Behavior:** Custom icon showing three interlocking circles (or Medicine Wheel inspired). Click opens sidebar with universe panels. Badge shows unread analysis count. Tooltip: "Three-Universe Intelligence".

### STCDashboardActivity
Activity bar icon for STC Dashboard.
- **Behavior:** Chart-inspired icon. Click opens STC sidebar with chart list and active chart detail. Badge shows number of active charts. Tooltip: "Structural Tension Charts".

### StoryMonitorActivity
Activity bar icon for Live Story Monitor.
- **Behavior:** Narrative/book-inspired icon. Click opens story monitor sidebar with event feed. Badge shows recent beat count. Tooltip: "Live Story Monitor". Pulsing animation when high-significance events occur.

---

## Supporting Structures
- VS Code Extension API: `viewsContainers` contribution point
- Icons as SVG with theme color support
- Activity bar position configurable
