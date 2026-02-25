# Engineer Lens (Mia)

> Technical precision analysis through the engineering universe.

## Desired Outcome
Code, schemas, and technical artifacts receive precise engineering analysis — identifying structural quality, type safety, performance implications, and architectural alignment.

## Current Reality
miadi-code's engineer lens is embedded in CLI prompt construction. Not reusable independently.

## Structural Tension
Engineering excellence naturally emerges from systematic technical analysis.

---

## Components

### EngineerAnalyzer
Core analysis engine for technical content.
- **Behavior:** Analyzes input for: code quality (readability, complexity, duplication), type safety (TypeScript strictness, schema compliance), performance (algorithmic complexity, resource usage), architecture (separation of concerns, dependency direction, module boundaries). Returns structured assessment with actionable items.
- **Data:**
  ```typescript
  interface EngineerAnalysis {
    universe: 'engineer';
    persona: { name: string; style: string }; // Default: Mia
    assessment: string;
    score: number; // 0-100
    categories: {
      quality: { score: number; issues: TechnicalIssue[] };
      typeSafety: { score: number; issues: TechnicalIssue[] };
      performance: { score: number; issues: TechnicalIssue[] };
      architecture: { score: number; issues: TechnicalIssue[] };
    };
    suggestions: string[];
    codeActions?: CodeAction[];
  }
  interface TechnicalIssue {
    severity: 'critical' | 'warning' | 'info';
    message: string;
    location?: { file: string; line: number; column: number };
    rule: string;
    fix?: string;
  }
  ```

### EngineerPromptBuilder
Constructs LLM prompts for engineering analysis.
- **Behavior:** Builds system prompt establishing Mia's engineering persona. Includes relevant context (language, framework, project conventions). Structures user prompt with analysis focus areas. Adapts prompt depth based on `quick`/`standard`/`deep` setting.

### SchemaAwareAnalysis
Engineering analysis enriched with workspace schema knowledge.
- **Behavior:** When schemas are available in `.mia/schemas/`, includes them in analysis context. Validates code against registered schemas. Reports schema compliance issues alongside code quality.

---

## Supporting Structures
- Persona configuration from `NarrativeIdentity` settings
- LLM engine selected from `multi-engine-adapter`
- Results mappable to VS Code `DiagnosticSeverity`
