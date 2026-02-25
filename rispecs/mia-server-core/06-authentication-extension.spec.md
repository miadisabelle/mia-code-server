# Authentication Extension

> Extended authentication supporting multi-universe identity.

## Desired Outcome
The existing code-server authentication (password/argon2) is extended to associate authenticated sessions with narrative identity — linking the developer to their three-universe persona configuration and permissions.

## Current Reality
code-server supports password-based authentication with argon2 hashing.

## Structural Tension
Narrative features need identity context beyond simple password auth.

---

## Components

### NarrativeIdentity
Identity layer on top of existing auth.
- **Behavior:** After successful password authentication, the session is enriched with a `NarrativeIdentity` containing the user's preferred universe focus, persona settings, and API keys for external services (Langfuse, LLM providers). Identity config stored in server config file.
- **Data:**
  ```typescript
  interface NarrativeIdentity {
    displayName: string;
    personas: {
      engineer: { name: string; style: string };
      ceremony: { name: string; tradition: string };
      story: { name: string; voice: string };
    };
    apiKeys: {
      langfuse?: { publicKey: string; secretKey: string };
      anthropic?: string;
      google?: string;
      ollama?: { host: string };
    };
    preferences: {
      defaultUniverse: string;
      autoAnalysis: boolean;
      traceEnabled: boolean;
    };
  }
  ```

### APIKeyManagement
Secure storage and injection of API keys for LLM and tracing services.
- **Behavior:** Keys stored encrypted in server config. Injected into module context at initialization. Never exposed through API responses. Validated on startup with connectivity checks.

---

## Supporting Structures
- Extends existing cookie-based session from code-server
- API keys encrypted at rest using server's certificate
- No changes to the core password authentication flow
