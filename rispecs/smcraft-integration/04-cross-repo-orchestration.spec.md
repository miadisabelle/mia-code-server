# Cross-Repo Orchestration

> Agentic coordination across repository boundaries as a first-class platform capability.

## Desired Outcome

mia-code-server provides **Cross-Repo Orchestration** — the ability for AI agents working within the IDE to coordinate work across multiple repositories simultaneously. Agents can read, write, and synchronize artifacts across repo boundaries, decompose tasks that span repos, and maintain coherent intent across distributed codebases. This session's two-agent coordination (smcraft + mia-code-server) is the proof-of-concept for this capability.

## Current Reality

- This session demonstrated cross-repo orchestration manually: Agent B (mia-code-server) read Agent A's PDE at `/b/trading/.pde/`, edited their decomposition markdown, created shared SMDF examples, and synchronized specifications across repo boundaries
- No formal protocol or tooling exists for this — it was achieved through filesystem access and PDE conventions
- The PDE engine (`pde-engine/`) decomposes prompts but within a single repo context
- The workspace lifecycle (`codevops-platform/07-workspace-lifecycle.spec.md`) tracks a single workspace, not cross-workspace coordination

## Structural Tension

The tension between single-repo agent work and multi-repo creative projects resolves toward a platform capability where agents naturally coordinate across repositories through shared protocols, synchronized decompositions, and cross-repo state awareness.

---

## Components

### CrossRepoContext

Multi-repository awareness for agent sessions.

- **Data:**
  ```typescript
  interface CrossRepoContext {
    primaryRepo: RepositoryRef;
    relatedRepos: RepositoryRef[];
    sharedArtifacts: SharedArtifact[];
    kinshipGraph: KinshipEdge[];
    agentCoordination: AgentCoordinationState;
  }

  interface RepositoryRef {
    name: string;
    path: string;
    kinshipRole: string;  // from KINSHIP.md
    pdeDecompositions: string[];  // .pde/ file paths
  }

  interface SharedArtifact {
    type: 'spec' | 'smdf' | 'vocabulary' | 'pde' | 'kinship';
    sourcePath: string;
    targetPaths: string[];
    syncDirection: 'push' | 'pull' | 'bidirectional';
  }
  ```
- **Behavior:** Built from KINSHIP.md files across repositories. When a workspace references external repos (via KINSHIP relations, submodules, or explicit paths), the context is populated with those repos' relevant artifacts. Agents can query: "What are the related repos? What PDE decompositions exist? What specs reference this repo?"

### CrossRepoDecomposition

PDE decomposition that spans repository boundaries.

- **Behavior:** Extends `pde-engine/01-decomposition-core.spec.md` to handle prompts that reference multiple repos. The decomposition identifies which intents belong to which repo, maps cross-repo dependencies, and generates linked `.pde/` files in each repo. Each repo's `.pde/` markdown references the other repos' decompositions.

### AgentCoordination

Protocol for multiple agents working across repos.

- **Behavior:** When an agent's PDE decomposition identifies work that belongs in another repo, it can: (1) create a `.pde/` file in that repo's directory with coordination notes, (2) edit existing `.pde/` files to add cross-repo awareness, (3) create shared vocabulary or SMDF files that both repos reference. Agents coordinate through the filesystem (shared `.pde/` directory) and through KINSHIP.md updates.

### KinshipDrivenDiscovery

Uses KINSHIP.md files to discover cross-repo integration points.

- **Behavior:** Reads KINSHIP.md from all accessible repos in the workspace. Builds a kinship graph showing relationships (upstream/downstream/sibling). When a spec in one repo references concepts from another (via the shared vocabulary), the system can surface the related specs for context. This enables agents to understand the full relational web of the codebase ecosystem.

---

## Supporting Structures

- `pde-engine/01-decomposition-core.spec.md` — base decomposition extended for cross-repo
- `pde-engine/05-steerable-decomposition.spec.md` — interactive editing of cross-repo decompositions
- `codevops-platform/07-workspace-lifecycle.spec.md` — workspace extended with cross-repo context
- `llms/llms-kinship-hub-system.md` — KINSHIP.md protocol for relational discovery
- `rispecs/KINSHIP.md` — this repo's kinship declarations

---

## Proof of Concept: This Session

This specification was born from the lived experience of this development session, where:
- Agent B (mia-code-server) read Agent A's (smcraft) PDE decomposition across repo boundaries
- Agent B created shared artifacts (vocabulary, SMDF example) consumed by both repos
- Agent B edited Agent A's PDE markdown to add coordination notes
- Cross-repo specifications were created that reference each other
- The KINSHIP.md files in both repos were updated to formalize the relationship

The capability described here would make this process **systematic and tooled** rather than manual.

---

**RISE Framework Compliance**: ✅ Creative Orientation | ✅ Structural Dynamics | ✅ Advancing Patterns | ✅ Desired Outcomes
