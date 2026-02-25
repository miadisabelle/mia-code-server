# Schema Operations

> Schema design, listing, export, and migration for narrative data structures.

## Desired Outcome
Developers create, manage, and evolve narrative schemas (story structures, character models, beat templates) through a unified schema system that works both as CLI commands and server API calls.

## Current Reality
miaco provides CLI commands for schema operations (`miaco schema design/list/export/migrate`). These are standalone terminal commands.

## Structural Tension
Schema management as a server module enables IDE-integrated schema authoring and validation.

---

## Components

### SchemaDesigner
Creates new narrative schemas from templates or custom definitions.
- **Behavior:** Accepts schema name, type (`story`, `character`, `beat`, `ncp`, `custom`), and optional template. Generates TypeScript interface, JSON Schema, and example data. Stores schema in workspace `.mia/schemas/` directory. Validates schema name uniqueness within workspace.
- **Data:**
  ```typescript
  interface SchemaDefinition {
    name: string;
    version: string;
    type: 'story' | 'character' | 'beat' | 'ncp' | 'custom';
    fields: SchemaField[];
    relationships?: SchemaRelationship[];
    metadata: { author: string; created: string; description: string };
  }
  interface SchemaField {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'reference';
    required: boolean;
    description?: string;
    default?: unknown;
    validation?: { pattern?: string; min?: number; max?: number };
  }
  ```

### SchemaLister
Lists schemas with filtering and search.
- **Behavior:** Lists all schemas in workspace with optional type filter. Returns name, version, type, field count, and last modified. Supports output in table, JSON, or YAML format.

### SchemaExporter
Exports schemas to various formats.
- **Behavior:** Exports schema definition as JSON Schema, TypeScript interfaces, OpenAPI component, or Markdown documentation. Target file path configurable. Supports batch export of all schemas.

### SchemaMigrator
Migrates schema data between versions.
- **Behavior:** Given source version and target version, generates migration script. Supports field additions (with defaults), renames, type changes, and removals. Validates existing data against new schema before migration. Generates rollback script.

---

## Creative Advancement Scenario

**Creative Advancement Scenario**: Designing a Story Schema

**User Intent**: Create a reusable story structure for narrative development
**Current Reality**: No formal schema for story data in the workspace
**Natural Progression Steps**:
  1. Developer calls `schema.design('HeroJourney', 'story')` through API or IDE command
  2. Schema designer generates template with standard story fields (title, arc, beats, characters)
  3. Developer customizes fields through IDE schema editor
  4. Schema saved and immediately available for validation
**Achieved Outcome**: Typed, validated story structure enabling consistent narrative development
**Supporting Features**: `SchemaDesigner`, `SchemaExporter`
