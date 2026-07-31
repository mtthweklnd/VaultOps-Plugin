# 01 — Custom BasesView Registration and Lifecycle Class

**What to build:** Implement `DevOpsBasesView` extending `BasesView` and register it in `src/main.ts` using `this.registerBasesView('devops-kanban', registration)`. Set up view lifecycle hooks to listen for query updates and manage container mounting.

**Target Plan:** [./plans/custom-bases-view.md](file:///C:/Users/mtthw/Vaults/test-vault/.obsidian/plugins/vault-devops/plans/custom-bases-view.md)

**Blocked by:** None — can start immediately

**Status:** ready-for-agent

## Acceptance Criteria
- [ ] Create `src/views/DevOpsBasesView.ts` extending `BasesView`.
- [ ] Implement `onload`, `onunload`, and `onDataUpdated` methods for updating view data.
- [ ] Register `devops-kanban` in `src/main.ts` inside `onload()` via `registerBasesView`.
- [ ] Clean up registration on plugin unload.
