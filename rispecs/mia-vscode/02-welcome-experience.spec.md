# Welcome Experience

> First-run and welcome page customization for mia-vscode.

## Desired Outcome
New users are greeted with a welcome experience that introduces the Three-Universe development approach, helps configure their narrative identity, and provides guided onboarding.

## Current Reality
VS Code has a default welcome page. No mia-specific onboarding.

## Structural Tension
A welcoming first experience naturally converts users into engaged narrative-driven developers.

---

## Components

### WelcomePage
Custom welcome tab for first-time users.
- **Behavior:** Displays on first launch. Introduces Three-Universe philosophy with visual metaphor. Shows quickstart steps: 1) Configure LLM engine, 2) Set universe preferences, 3) Create first STC chart, 4) Start coding with narrative intelligence. Links to documentation and tutorial. Dismissible with "Don't show again" option.
- **Styling:** Full-width page with three-universe color sections. Animated introduction sequence. Interactive setup wizard.
- **Layout:** Contains `IntroSection`, `SetupWizard`, `QuickStartGuide`, `ResourceLinks`

### SetupWizard
Step-by-step configuration for new users.
- **Behavior:** Multi-step wizard: 1) Choose LLM engine (Claude/Gemini/Ollama), 2) Enter API key, 3) Set universe preferences, 4) Name your development persona. Results saved to mia-code-server configuration. Each step includes explanation of why this matters.

### QuickStartGuide
Interactive guide to first narrative operations.
- **Behavior:** After setup, offers guided tour: open agent panel, create first chart, analyze first file. Each step highlights the relevant UI element. Completion generates a "first session" beat.

---

## Supporting Structures
- Welcome page as a VS Code webview contribution
- Setup wizard results saved to server config via API
- Tour system uses VS Code's built-in walkthrough API
