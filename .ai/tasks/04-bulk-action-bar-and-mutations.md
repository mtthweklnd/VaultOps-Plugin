# 04 — Floating Bulk Action Bar & Batch Frontmatter Mutations

**What to build:** When 1 or more work items are selected, a floating Bulk Action Bar appears at the bottom of the view shell. Users can perform batch updates (Change Status, Change Priority, Change Project, Delete) across all selected items in a single multi-file write operation.

**Blocked by:** 03 — Multi-Select Work Item State & Selection Handlers in Views

**Status:** ready-for-agent

- [ ] Create `BulkActionBar.svelte` component that floats at the bottom of `MainViewShell` when selected items > 0
- [ ] Add dropdown controls to Bulk Action Bar for Status, Priority, and Project Key mutations
- [ ] Add a Delete / Archive button with confirmation modal for selected items
- [ ] Implement `batchUpdateWorkItems` method in `WorkItemManager` to safely update frontmatter across multiple files via `processFrontMatter`
- [ ] Clear selection state and emit notification toast upon successful batch operation completion
