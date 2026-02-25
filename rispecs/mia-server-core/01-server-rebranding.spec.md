# Server Rebranding

> Rebrand code-server as mia-code-server across all packaging, references, and distribution channels.

## Desired Outcome
The platform publishes as `mia-code-server` with its own identity, CLI entry point, documentation, and npm/Docker distribution — while preserving the underlying code-server infrastructure.

## Current Reality
The repository is a fork of `coder/code-server` with all references pointing to the original project name, homepage, and binary.

## Structural Tension
The mia-code-server identity creates a natural container for narrative-driven development features that don't belong under the generic code-server brand.

---

## Components

### PackageIdentity
The npm package manifest defines the platform identity.
- **Behavior:** `package.json` uses name `mia-code-server`, description referencing narrative-driven CoDevOps, homepage pointing to miadisabelle GitHub, repository URL updated, bin entry changed from `code-server` to `mia-code-server`
- **Data:**
  ```json
  {
    "name": "mia-code-server",
    "description": "Narrative-Driven CoDevOps Development Platform — Remote VS Code with Three-Universe Intelligence",
    "homepage": "https://github.com/miadisabelle/mia-code-server",
    "bugs": { "url": "https://github.com/miadisabelle/mia-code-server/issues" },
    "repository": "https://github.com/miadisabelle/mia-code-server",
    "bin": { "mia-code-server": "out/node/entry.js" },
    "keywords": ["vscode", "development", "ide", "narrative-driven", "codevops", "three-universe", "mia", "remote-development", "agentic-ide"]
  }
  ```

### CLIEntryPoint
The command-line binary name and help output.
- **Behavior:** The `out/node/entry.js` responds to `mia-code-server` command. Help text displays mia-code-server branding. The `--help` flag shows platform description and narrative module options. Version output includes `mia-code-server vX.Y.Z`.
- **Layout:** Entry point at `src/node/entry.ts` imports main, which bootstraps the server with mia-code-server identity.

### BuildScripts
CI/CD scripts reference new naming.
- **Behavior:** All scripts in `ci/` that reference `code-server` in output paths, package names, or Docker tags use `mia-code-server` instead. Build artifacts use `mia-code-server` prefix. Docker images tag as `mia-code-server`.
- **Layout:** Scripts at `ci/build/`, `ci/dev/`, `ci/steps/`

### BrowserTitle
The browser tab and page titles reflect branding.
- **Behavior:** The HTML page title shows "mia-code-server" instead of "code-server". Login page header displays mia-code-server branding. Service worker registration uses mia-code-server scope.
- **Layout:** Templates at `src/browser/pages/`, service worker at `src/browser/serviceWorker.ts`

### DocumentationReferences
All documentation references updated.
- **Behavior:** `README.md`, `docs/`, `CHANGELOG.md` reference mia-code-server. Installation instructions use new package name. Links point to miadisabelle organization.

### InstallScript
The `install.sh` script installs mia-code-server.
- **Behavior:** The standalone install script downloads and installs `mia-code-server` binary. GitHub release URLs point to miadisabelle/mia-code-server. Service files use mia-code-server naming.

---

## Supporting Structures
- `src/node/constants.ts` — Update product name constant
- `src/node/cli.ts` — Update CLI description and usage text
- `src/node/app.ts` — Update server header identification
- `src/browser/pages/` — Update HTML templates
- `.github/` — Update workflow references

## Creative Advancement Scenario

**Creative Advancement Scenario**: Developer Installs mia-code-server

**User Intent**: Install a narrative-driven remote IDE platform
**Current Reality**: Only code-server exists as a generic remote VS Code
**Natural Progression Steps**:
  1. Developer runs `npm install -g mia-code-server` or uses install script
  2. Platform starts with `mia-code-server` command showing Three-Universe branding
  3. Browser displays mia-code-server identity with narrative intelligence ready
**Achieved Outcome**: A branded platform ready for narrative-driven development
**Supporting Features**: `PackageIdentity`, `CLIEntryPoint`, `BrowserTitle`
