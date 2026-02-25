# GitHub Integration

> Deep GitHub API integration for repository operations.

## Desired Outcome
mia-code-server integrates deeply with GitHub — managing repositories, PRs, issues, and actions through narrative-aware operations that understand development context.

## Current Reality
code-server has basic git support through VS Code. No GitHub API integration.

## Structural Tension
GitHub integration enables narrative intelligence to span the full development lifecycle.

---

## Components

### GitHubClient
Authenticated GitHub API client with narrative context.
- **Behavior:** Wraps Octokit for GitHub API calls. Authenticates via personal access token or GitHub App. All API calls logged with narrative context. Rate limiting with intelligent retry. Caches frequently accessed data (repo metadata, user profiles).

### PRNarrativeEnhancer
Enhances pull requests with narrative context.
- **Behavior:** Generates PR descriptions from STC charts and story beats. Adds narrative summary as PR comment. Links PRs to active charts. Review suggestions include universe-specific insights. PR merge generates integration milestone beat.

### IssueChartLinker
Links GitHub issues to STC charts.
- **Behavior:** Automatically suggests linking new issues to STC charts based on content. Creates new charts from issues. Updates chart status when linked issues are closed. Bi-directional sync: chart updates reflected in issue comments.

### ActionsMonitor
Monitors GitHub Actions workflow status.
- **Behavior:** Polls GitHub Actions for workflow run status. Surfaces failures as narrative tension events. Success events become resolution beats. Build/test metrics tracked over time. Status visible in IDE status bar.

---

## Supporting Structures
- GitHub PAT or App credentials stored in server config
- API calls routed through server proxy to avoid CORS
- Webhook processor (see `01-webhook-processor.spec.md`) for push events
