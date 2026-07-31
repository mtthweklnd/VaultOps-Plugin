# Decision Toolkit: Prioritizing Future Features for `vault-devops`

*Generated: July 30, 2026*
*Target Project*: [`vault-devops`](file:///C:/Users/mtthw/Vaults/test-vault/.obsidian/plugins/vault-devops/ARCHITECTURE.md)

---

## 1. Context & Decision Scope

**Core Question**: *Which future features will yield the highest user value and architectural sustainability for the `vault-devops` Obsidian plugin?*

### Current Plugin Baseline
The `vault-devops` plugin is currently a clean, local-first agile project management tool with:
- **Work Items**: Epic, Feature, Story, Task, Bug stored as Markdown notes with frontmatter.
- **Views**: Kanban Board (drag-and-drop), Backlog Tree (3-tier hierarchy & progress rollups), Project Dashboard (derived metrics).
- **Core Engine**: `WorkItemManager` indexing vault notes via `metadataCache` with zero external dependencies.

### The Strategic Tension
Balancing **lightweight, local Markdown simplicity** vs. **feature-rich DevOps capabilities** (sprints, query languages, release management). Over-engineering runs the risk of introducing "JIRA bloat" in Obsidian, while under-engineering leaves power users needing more structure.

---

## 2. Feature Candidate Inventory

Here are 7 high-potential feature extensions categorized by domain:

| Feature Candidate | Description | Primary Target Audience |
|-------------------|-------------|-------------------------|
| **1. Sprint & Iteration Management** | Add `sprint` / `milestone` frontmatter fields, Sprint selector filter, Burndown/Burnup charts on Dashboard. | Agile teams & sprint-focused solos |
| **2. Inline Codeblock Views (`devops-board`)** | Render interactive Kanban boards or Backlog widgets inside standard notes (like Dataview or Kanban plugin). | Dashboard note builders |
| **3. Hierarchical Estimate Rollups & Time Tracking** | Auto-calculate time estimates and `timeSpent` from Task → Story → Epic; track remaining effort. | Estimators & project managers |
| **4. Advanced Query Engine (JQL-style)** | Text query parser (e.g. `project: PROJ AND status: "In Progress" AND priority >= High`). | Power users with 100+ items |
| **5. Custom Workflows & WIP Limits** | Per-project configurable status transitions and column WIP (Work-In-Progress) limit warnings. | Kanban practitioners |
| **6. Git & Release Generator** | Link work item IDs (`PROJ-101`) to git commits/branches; auto-generate Markdown CHANGELOGs. | Developers & release leads |
| **7. Bulk Editing & Quick Actions** | Multi-select in Backlog/Kanban to change status, priority, or parent in one click. | High-velocity project leads |

---

## 3. First Principles Test

*Does this feature solve a problem that users cannot easily solve with plain Markdown/Dataview?*

| Feature Candidate | Solves Unique Problem? | Score (1-5) | Rationale |
|-------------------|-------------------------|-------------|-----------|
| **Sprint Management** | **Yes** | 5/5 | Vault notes lack temporal sprint scoping & automated burndown calculation out-of-the-box. |
| **Inline Codeblock Views** | **Yes** | 5/5 | Enables embedding DevOps views directly into weekly notes or project dashboards. |
| **Estimate Rollups** | **Yes** | 4/5 | Dynamic parent aggregation without manual calculation is a key pain point in plain Markdown. |
| **Advanced Query Engine** | **Partial** | 3/5 | Dataview handles queries, but `vault-devops`-aware filtering on status/hierarchy is much faster. |
| **Custom Workflows & WIP** | **Yes** | 4/5 | Visual WIP caps prevent context-switching clutter in Kanban workflows. |
| **Git & Release Generator** | **Partial** | 3/5 | External scripts can generate changelogs, but integrated Obsidian note updates add seamlessness. |
| **Bulk Editing** | **Yes** | 4/5 | Batch YAML frontmatter modification across 10+ notes is tedious manually. |

---

## 4. Bias Audit

Recognizing cognitive traps when planning plugin evolution:

- [x] **Shiny Object Syndrome**: *Wanting to build a full JIRA clone or complex query parser because it sounds impressive.*
  - *Counter-check*: Will users actually use JQL syntax in Obsidian, or do they just want simple dropdowns and tag filters?
- [x] **Feature Creep**: *Adding heavy database-like features that slow down index performance.*
  - *Counter-check*: `WorkItemManager` stays fast because frontmatter parsing is cached. Anything added must preserve `metadataCache` reactivity.
- [x] **Reinventing the Wheel**: *Rebuilding what Dataview or Obsidian Kanban already does.*
  - *Counter-check*: Focus strictly on what makes `vault-devops` distinct: **hierarchical DevOps rollups, work item lifecycle, and project scoping**.
- [x] **Developer Assumption Bias**: *Assuming all users use Git branches and release notes.*
  - *Counter-check*: Many Obsidian users track personal projects, writing, or product tasks without Git.

---

## 5. Trade-off & Effort vs. Impact Matrix

```
 HIGH IMPACT
     │
     │   [1. Sprint Management]        [2. Inline Codeblock Views]
     │   (High Impact, Med Effort)     (High Impact, Low Effort)
     │
     │   [7. Bulk Editing]             [3. Estimate Rollups]
     │   (Med Impact, Low Effort)      (Med Impact, Med Effort)
     │
     │   [5. Custom Workflows & WIP]   [4. Advanced Query Engine]
     │   (Med Impact, Med Effort)      (Low Impact, High Effort)
     │
     │                                 [6. Git & Release Generator]
     │                                 (Low Impact, High Effort)
     └─────────────────────────────────────────────────────────────
 LOW IMPACT                                            HIGH EFFORT
       LOW EFFORT ───────────────►
```

---

## 6. Scenario Analysis & Pre-Mortem

### Scenario 1: We build Inline Codeblock Views (`devops-board`)
- **Outcome**: Users can write ````devops-board project="PROJ" view="kanban"```` inside any note.
- **Pre-Mortem Risk**: Multiple active CodeMirror views mounting Svelte components might leak memory or cause excessive re-indexes on note changes.
- **Mitigation**: Use `MarkdownRenderChild` lifecycle hooks to properly destroy Svelte instances when notes close.

### Scenario 2: We build Sprint Management & Burndown
- **Outcome**: Brings actual Agile velocity tracking into Obsidian without needing external tools.
- **Pre-Mortem Risk**: Historical data tracking (e.g. "what was completed on day 5 of the sprint?") is hard in plain frontmatter without writing snapshot files.
- **Mitigation**: Store sprint start/end dates in project settings, compute burndown dynamically from frontmatter `updated`/`completed` timestamps.

### Scenario 3: Over-engineering a custom JQL Query Parser
- **Outcome**: High maintenance burden, fragile syntax errors, low user adoption compared to simple filter pills.
- **Verdict**: **Deprioritize** in favor of visual multi-select filters.

---

## 7. Recommended Action Plan & Feature Roadmap

Based on the decision analysis, here is the prioritized 3-Phase Roadmap:

### Phase 1: High-Impact / High-Leverage Quick Wins (Next Release)
1. **Inline Codeblock Views (`devops-board`)**
   - Register Markdown codeblock processor `devops-view` / `devops-board`.
   - Allows embedding live Kanban or Backlog widgets inside standard vault notes.
2. **Bulk Frontmatter Operations**
   - Multi-select items in Backlog Tree to batch-update status, priority, or assignment.
3. **Hierarchical Estimate Rollup Engine**
   - Auto-sum estimates from Tasks → Story → Feature → Epic and render progress bars.

### Phase 2: Core Agile Expansion (Medium Term)
1. **Sprint & Milestone Scoping**
   - Frontmatter key `sprint: "Sprint 12"`.
   - Sprint filter dropdown on `MainViewShell`.
   - Sprint Burndown widget on `ProjectDashboard`.
2. **Custom Workflows & WIP Limit Indicators**
   - Support custom status pipelines per project with column capacity warnings on Kanban.

### Phase 3: Advanced Ecosystem Synergy (Longer Term)
1. **Canvas / Visual Card Mapping**
   - Convert Obsidian Canvas nodes to Work Items or visualize Backlog relationships on Canvas.
2. **Git Commit / Note Auto-linking**
   - Command palette utility to paste commit references or create branch names from work item IDs (`feature/PROJ-101`).

---

## 8. 10-10-10 Evaluation

- **In 10 minutes**: Focus is clear; we won't waste time building complex custom query parsers.
- **In 10 months**: `vault-devops` becomes the premier Agile PM plugin in the Obsidian ecosystem due to inline codeblock rendering & sprint rollups.
- **In 10 years**: The vault remains clean, plain Markdown without proprietary database lock-in.
