# Editor Overlays

> Narrative overlay annotations on editor content.

## Desired Outcome
The code editor displays inline narrative annotations — universe analysis highlights, STC relevance markers, and beat indicators — as non-intrusive overlays that enrich the coding experience.

## Current Reality
VS Code supports inline decorations, code lenses, and hover providers. No narrative overlays.

## Structural Tension
Contextual narrative information at the point of code reduces context-switching to separate panels.

---

## Components

### UniverseCodeLens
Code lens showing universe analysis above functions/classes.
- **Behavior:** Implements `vscode.CodeLensProvider`. Above each function/class definition, shows a code lens with last analysis summary. Click opens detailed three-universe analysis for that code block. Lens text: "🔧 Score: 85 | 🌿 Score: 72 | 📖 Score: 91". Only shown for recently analyzed code.

### NarrativeHoverProvider
Extended hover showing narrative context.
- **Behavior:** Implements `vscode.HoverProvider`. When hovering over code that has narrative context (referenced in charts, beats, or analyses), shows additional hover content with narrative summary. Non-intrusive — only adds to existing hover, doesn't replace.

### InlineAnnotations
Inline decorations for narrative markers.
- **Behavior:** Uses `vscode.TextEditorDecorationType` to add subtle annotations. STC-relevant code sections get a thin left border in chart color. Beat-related code gets a small icon in the gutter. Analysis issues get colored underlines matching universe (blue/green/purple).

---

## Supporting Structures
- VS Code Extension APIs: `CodeLensProvider`, `HoverProvider`, `TextEditorDecorationType`
- Decorations are lightweight and configurable (off/minimal/full)
- Analysis results cached per-file for instant decoration
