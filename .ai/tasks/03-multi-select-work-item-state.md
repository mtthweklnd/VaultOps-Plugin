# 03 — Multi-Select Work Item State & Selection Handlers in Views

**What to build:** Users can select multiple work items across `BacklogTree` and `KanbanBoard` using selection checkboxes or `Ctrl`/`Cmd` + Click. The selection state is managed interactively across the view shell.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] Add reactive selection state management (Set of item file paths) to `MainViewShell` and child view components
- [ ] Add selection checkboxes to `BacklogTree` items and `KanbanBoard` cards
- [ ] Implement `Ctrl`/`Cmd` + Click toggling and `Shift` + Click range selection in views
- [ ] Provide Select All / Deselect All controls when selection mode is active
- [ ] Visual highlighting on selected cards and tree rows
