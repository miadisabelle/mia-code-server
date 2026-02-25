# Module API

> Programmatic API for server-side integration of miaco operations.

## Desired Outcome
All miaco operations available as a typed TypeScript API that server modules, VS Code extensions, and MCP tools call directly — the canonical interface for engineering world operations.

## Current Reality
miaco operations are CLI commands. No programmatic API exists.

## Structural Tension
Multiple consumers (server routes, IDE extensions, MCP tools) need the same operations without going through CLI parsing.

---

## Components

### MiacoAPI
Top-level API object exposing all miaco operations.
- **Behavior:** Singleton initialized with server context. Provides typed methods for all operations. Methods return promises with typed results. Errors thrown as typed exceptions. Events emitted for all operations.
- **Data:**
  ```typescript
  interface MiacoAPI {
    schema: {
      design(opts: SchemaDesignOpts): Promise<SchemaDefinition>;
      list(opts?: SchemaListOpts): Promise<SchemaDefinition[]>;
      export(opts: SchemaExportOpts): Promise<string>;
      migrate(opts: SchemaMigrateOpts): Promise<MigrationResult>;
    };
    validate: {
      ncp(opts: ValidateOpts): Promise<ValidationResult>;
      beat(opts: ValidateOpts): Promise<ValidationResult>;
      coherence(opts: CoherenceOpts): Promise<ValidationResult>;
      types(opts: TypeCheckOpts): Promise<ValidationResult>;
      pipeline(opts: PipelineOpts): Promise<ValidationResult[]>;
    };
    trace: {
      start(opts: TraceStartOpts): Promise<NarrativeTrace>;
      log(opts: TraceLogOpts): Promise<TraceSpan>;
      end(opts?: TraceEndOpts): Promise<NarrativeTrace>;
      list(opts?: TraceListOpts): Promise<NarrativeTrace[]>;
      view(traceId: string, format?: string): Promise<string>;
      correlation(opts: CorrelationOpts): Promise<CorrelationHeaders>;
    };
    chart: {
      create(opts: ChartCreateOpts): Promise<STCChart>;
      list(opts?: ChartListOpts): Promise<STCChart[]>;
      addAction(chartId: string, opts: ActionOpts): Promise<STCAction>;
      complete(chartId: string, actionId: string): Promise<STCAction>;
      review(chartId: string): Promise<ChartReview>;
      visualize(chartId: string, format?: string): Promise<string>;
    };
  }
  ```

### EventEmission
All operations emit events for observability.
- **Behavior:** Each method emits `before:operation` and `after:operation` events on the module bus. Events carry operation name, arguments (sanitized), result summary, and timing. Enables other modules to react to miaco operations.

---

## Supporting Structures
- API types exported as npm package for consumer type safety
- Internal implementation delegates to operation-specific classes
- Consistent error handling with `MiacoError` hierarchy
