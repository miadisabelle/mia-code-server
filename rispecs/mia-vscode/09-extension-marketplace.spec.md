# Extension Marketplace

> Custom extension gallery/registry for mia-specific extensions.

## Desired Outcome
mia-vscode can discover, install, and update extensions from a mia-specific marketplace alongside or instead of the standard VS Code marketplace — enabling curated narrative development extensions.

## Current Reality
VS Code uses Microsoft's extension marketplace. mia-vscode fork can configure alternative galleries.

## Structural Tension
A curated marketplace ensures users find narrative-relevant extensions easily.

---

## Components

### MarketplaceConfiguration
Extension gallery service configuration.
- **Behavior:** product.json configures marketplace URLs. Initially uses Open VSX Registry as base. Mia-specific extensions published to registry. Standard VS Code extensions remain accessible. Curated featured list highlights narrative development tools.

### ExtensionRegistry
Server-side extension registry for mia extensions.
- **Behavior:** Hosts mia-specific extensions (three-universe, STC dashboard, story monitor). Provides VSIX packages for download. Extension metadata includes universe compatibility tags. API compatible with VS Code marketplace protocol.

### BundledExtensions
Extensions pre-installed with mia-vscode.
- **Behavior:** mia-vscode ships with core extensions pre-installed: mia-three-universe, mia-stc-charts, mia-story-monitor, mia-theme. Extensions auto-update from registry. Cannot be uninstalled (core platform functionality).

---

## Supporting Structures
- Open VSX Registry compatibility for open-source extension access
- VSIX packaging for mia extensions
- Extension signing for security
