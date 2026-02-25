# Multi-Engine Adapter

> Claude/Gemini/Ollama engine abstraction for LLM operations.

## Desired Outcome
All LLM operations (universe analysis, prompt completion, story generation) use a unified engine adapter that supports Claude, Gemini, and Ollama — enabling developers to choose their preferred or available LLM provider.

## Current Reality
miadi-code supports multiple engines via CLI flags (`--gemini`, `--ollama`). Engine selection is per-session.

## Structural Tension
Provider flexibility ensures the platform works in any environment — cloud, local, air-gapped.

---

## Components

### EngineAdapter
Unified interface for LLM operations.
- **Behavior:** All engines implement `EngineAdapter` interface. Adapter handles prompt formatting, response parsing, streaming support, and error handling per provider. Engine selected from config or per-request override.
- **Data:**
  ```typescript
  interface EngineAdapter {
    name: string;
    available(): Promise<boolean>;
    complete(request: CompletionRequest): Promise<CompletionResponse>;
    stream(request: CompletionRequest): AsyncIterable<string>;
  }
  interface CompletionRequest {
    systemPrompt: string;
    userMessage: string;
    context?: string;
    maxTokens?: number;
    temperature?: number;
    model?: string;
  }
  interface CompletionResponse {
    text: string;
    usage: { promptTokens: number; completionTokens: number };
    model: string;
    finishReason: string;
  }
  ```

### ClaudeAdapter
Anthropic Claude API adapter.
- **Behavior:** Uses `@anthropic-ai/sdk`. Supports Claude Sonnet, Opus, Haiku. Handles rate limiting with exponential backoff. Streaming via server-sent events.

### GeminiAdapter
Google Gemini API adapter.
- **Behavior:** Uses Google AI SDK. Supports Gemini Pro and Flash models. Handles API key authentication. Maps prompt format to Gemini's content structure.

### OllamaAdapter
Local Ollama adapter for private/offline use.
- **Behavior:** Connects to local Ollama instance at configured host. Supports any model available in Ollama. No API key required. Connectivity check on startup.

### EngineSelector
Selects optimal engine for each request.
- **Behavior:** Default engine from config. Per-request override via options. Fallback chain: primary engine → secondary → tertiary. Availability check before each request. Engine preference saved per-session.

---

## Supporting Structures
- Adapters lazy-loaded on first use
- API keys from `NarrativeIdentity` configuration
- Request/response logging via tracing system
