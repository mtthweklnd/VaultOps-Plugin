# 03 — Bi-directional Interactions and Bases View Options

**What to build:** Add interactive capabilities (card click to open note, column drop/status change frontmatter updates) and register Bases view options (`BasesPropertyOption`, `BasesToggleOption`) for custom toolbar settings.

**Target Plan:** [./plans/custom-bases-view.md](file:///C:/Users/mtthw/Vaults/test-vault/.obsidian/plugins/vault-devops/plans/custom-bases-view.md)

**Blocked by:** 02 — Svelte Kanban Board and Card Components

**Status:** ready-for-agent

## Acceptance Criteria
- [ ] Clicking a card in `BasesKanbanCard.svelte` opens the corresponding markdown file in Obsidian.
- [ ] Dragging or selecting status on a card updates the entry's underlying note frontmatter using `fileManager.processFrontMatter`.
- [ ] Implement `options` array in `BasesViewRegistration` allowing users to select group-by property and card display toggles in Bases view settings.
- [ ] Test build (`npm run build`) to ensure clean compilation without TypeScript errors.
