# product.json Customization

> VS Code product.json overrides for mia-vscode identity.

## Desired Outcome
The mia-vscode fork has a customized product.json that defines the platform identity — name, version, extension gallery, telemetry endpoint, and branding assets.

## Current Reality
mia-vscode fork uses microsoft/vscode's default product.json.

## Structural Tension
Product identity configuration is the foundation for all visual and behavioral customization.

---

## Components

### ProductConfiguration
Key product.json overrides.
- **Data:**
  ```json
  {
    "nameShort": "Mia Code",
    "nameLong": "Mia Code - Narrative-Driven Development",
    "applicationName": "mia-code",
    "dataFolderName": ".mia-code",
    "win32MutexName": "miacode",
    "serverApplicationName": "mia-code-server",
    "serverDataFolderName": ".mia-code-server",
    "urlProtocol": "mia-code",
    "extensionAllowedProposedApi": [
      "mia.three-universe",
      "mia.stc-charts",
      "mia.story-monitor"
    ],
    "extensionsGallery": {
      "serviceUrl": "https://marketplace.mia-code.dev/api",
      "cacheUrl": "https://marketplace.mia-code.dev/cache",
      "itemUrl": "https://marketplace.mia-code.dev/items"
    },
    "linkProtectionTrustedDomains": [
      "https://mia-code.dev",
      "https://github.com/miadisabelle"
    ]
  }
  ```

### BrandingAssets
Custom icons and logos.
- **Behavior:** Replace VS Code icons with mia-code branded versions. Application icon (taskbar, dock), splash screen logo, marketplace icon, about dialog logo. Assets in multiple sizes for different OS requirements.

---

## Supporting Structures
- product.json is the central configuration for VS Code identity
- Changes require VS Code rebuild from source
- Extension gallery URL initially points to standard marketplace (can be customized later)
