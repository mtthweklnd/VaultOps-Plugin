# 02 — In-Memory Hierarchical Estimate Rollup Calculation & UI Progress Indicators

**What to build:** Parent work items (Epics, Features, Stories) dynamically aggregate `estimate` and `timeSpent` frontmatter values from child work items in `WorkItemManager`. Displays progress bars and effort metrics on Backlog tree items and Kanban cards without writing derived values to parent Markdown files.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] Add `estimate` and `timeSpent` parsing support to `parseWorkItemFromFile` in `WorkItemManager`
- [ ] Implement in-memory recursive parent rollup calculation for total estimates, time spent, and progress percentage
- [ ] Render effort metrics and visual progress bars on `BacklogTree` nodes
- [ ] Render effort metrics and visual progress bars on `KanbanBoard` cards
- [ ] Ensure rollups recompute reactively whenever child item metadata changes
