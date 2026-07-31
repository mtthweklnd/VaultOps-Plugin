# Plan: Obsidian Custom Bases View (Kanban Board)

*Date*: 2026-07-30  
*Source Roadmap*: [./ROADMAP.md](file:///C:/Users/mtthw/Vaults/test-vault/.obsidian/plugins/vault-devops/ROADMAP.md)

## Acceptance Criteria
- [ ] Register a custom `BasesView` in Obsidian using `this.registerBasesView('devops-kanban', registration)`.
- [ ] Expose view registration options (`options` function) in the Bases toolbar for selecting group-by property, card tags, and column sorting.
- [ ] Implement a Svelte-based Kanban Board component (`BasesKanbanView.svelte`) rendering columns for `BasesEntryGroup` items or grouped property values.
- [ ] Provide card UI for each `BasesEntry` showing title/file name, property tags, assignees, and quick status controls.
- [ ] Enable bi-directional interactivity: clicking a card opens the underlying note, and dragging/updating status updates note frontmatter/properties via Obsidian Bases API or Vault API.
- [ ] Safely handle query updates (`BasesQueryResult`) when notes in the vault change, automatically re-rendering columns without state corruption.

## Architecture & Design Decisions
- **Decision 1: View Class & Lifecycle**: Extend `BasesView` from `'obsidian'`. Override `onDataUpdated()` or subscribe to `data` changes. Mount `BasesKanbanView.svelte` inside the view's container element using Svelte 4 props store or reactive updates.
- **Decision 2: Config & Options**: Define `BasesViewRegistrationOptions` including `BasesPropertyOption` for column grouping (e.g. status/type) and `BasesToggleOption` for showing/hiding empty columns and property tags.
- **Decision 3: Svelte Integration**: Keep UI rendering inside `src/components/bases/BasesKanbanView.svelte` and `BasesKanbanCard.svelte` to match the project's Svelte architecture.
- **Decision 4: Bi-directional Mutability**: Cards trigger Obsidian's file navigation on click (`app.workspace.openLinkText` or `app.workspace.getLeaf().openFile()`) and update note frontmatter using `app.fileManager.processFrontMatter` when cards are moved between columns.

## Overview & Scope
This plan introduces a custom Bases View for Obsidian 1.8+ `.base` files, integrated directly into the `vault-devops` plugin. Users can view any Bases query as an interactive Kanban board directly within native Obsidian `.base` views, with custom grouping options, Svelte-powered rendering, and real-time vault syncing.
