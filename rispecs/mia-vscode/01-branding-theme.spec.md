# Branding & Theme

> Mia visual identity and color theming for the VS Code fork.

## Desired Outcome
mia-vscode presents a distinctive visual identity — with three-universe inspired color palette, custom icons, and branded UI elements — that immediately communicates this is a narrative-driven development platform.

## Current Reality
VS Code has its default theming. mia-vscode fork exists but is unmodified.

## Structural Tension
Visual identity creates belonging and recognition for the platform's unique approach.

---

## Components

### ColorTheme
Three-universe inspired color theme.
- **Behavior:** Default dark theme with three accent colors: Engineer Blue (#4A9EFF), Ceremony Green (#4ADE80), Story Purple (#A78BFA). Editor background uses subtle gradients. Active universe indicated by accent color. Includes light theme variant. Theme registered as default for mia-vscode.
- **Data:**
  ```json
  {
    "name": "Mia Three Universe Dark",
    "type": "dark",
    "colors": {
      "editor.background": "#1A1B26",
      "activityBar.background": "#16161E",
      "sideBar.background": "#1A1B26",
      "statusBar.background": "#16161E",
      "titleBar.activeBackground": "#16161E",
      "tab.activeBackground": "#1E1F2E",
      "terminal.mia.engineer": "#4A9EFF",
      "terminal.mia.ceremony": "#4ADE80",
      "terminal.mia.story": "#A78BFA"
    }
  }
  ```

### IconTheme
Custom file and activity bar icons.
- **Behavior:** File icons for `.mia/`, `.stc/`, `.ncp.json`, `.beat.json` files. Activity bar icons for Three-Universe panel, Charts panel, Live Story Monitor. Status bar icons for universe indicators. All icons SVG-based with theme color support.

### SplashBranding
Startup and loading branding.
- **Behavior:** Loading screen shows mia-code-server logo. Title bar prefix: "Mia Code". Window title format: `Mia Code - {workspace}`. About dialog shows platform version and three-universe philosophy.

---

## Supporting Structures
- Theme files in `extensions/theme-mia/` within mia-vscode
- Icon assets in `resources/icons/`
- product.json branding overrides (see `08-product-json.spec.md`)
