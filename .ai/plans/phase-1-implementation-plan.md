# Technical Specification: `vault-devops` Phase 1 Features

*Date*: July 30, 2026  
*Status*: Approved via `/grill-me` alignment  
*Target Roadmap*: [.ai/plans/future-features-roadmap.md](file:///C:/Users/mtthw/Vaults/test-vault/.obsidian/plugins/vault-devops/.ai/plans/future-features-roadmap.md)

---

## 1. Feature 1: Inline Codeblock Views (`devops-board` & `devops-view`)

### Overview
Allows users to embed interactive Kanban boards, Backlog trees, and Project Dashboards inside standard Obsidian Markdown notes using codeblocks.

### Syntax Specifications
````yaml
```devops-board
project: PROJ
view: kanban # Options: kanban | backlog | dashboard
sprint: current
limit: 10
```
````

### Architecture & Lifecycle
- **Processor Registration**: Registered in `main.ts` via `this.registerMarkdownCodeblockProcessor('devops-board', ...)`.
- **Lifecycle Management**: Wrap Svelte component mounts in Obsidian's `MarkdownRenderChild`.
- **Reactivity**: Subscribes to `WorkItemManager` data change events. On file change, the mounted Svelte instance is updated reactively.
- **Cleanup**: `onunload()` on `MarkdownRenderChild` destroys the Svelte instance via `$destroy()` to avoid memory leaks.

---

## 2. Feature 2: Bulk Frontmatter Operations

### Overview
Enables multi-selection of work items in the Backlog Tree and Kanban Board to apply batch actions across notes in a single click.

### UX & Interface
- **Selection**: Checkboxes on items + `Ctrl`/`Cmd` + Click multi-select support.
- **Floating Action Bar**: Renders at the bottom of the active view when 1+ items are selected.
- **Batch Actions**:
  - Update Status (e.g., move 5 items to "In Progress")
  - Update Priority (e.g., bump to "High")
  - Assign / Change Project
  - Delete / Archive Work Items

---

## 3. Feature 3: Hierarchical Estimate Rollup Engine

### Overview
Dynamically calculates parent effort rollups (Task → Story → Feature → Epic) based on `estimate` and `timeSpent` YAML frontmatter fields.

### Calculation Logic
- Aggregation is performed **in-memory** by `WorkItemManager` upon indexing.
- Parent notes do **not** have derived totals written back to their frontmatter, keeping vault files clean.
- Computes:
  - `totalEstimate` = Sum of all leaf-node estimates under the parent tree.
  - `totalTimeSpent` = Sum of all leaf-node time spent under the parent tree.
  - `progressPercent` = `(totalTimeSpent / totalEstimate) * 100`.

### UI Visualization
- Compact visual progress bar rendered on parent items in `BacklogTree.svelte` and `KanbanBoard.svelte`.
