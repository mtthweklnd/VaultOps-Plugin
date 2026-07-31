# 01 — Markdown Codeblock Processor for Embedded DevOps Views

**What to build:** Users can insert a ````devops-board```` or ````devops-view```` YAML codeblock inside any Obsidian note to render live interactive Kanban, Backlog, or Dashboard widgets. Embedded views respond reactively to vault data changes and unmount cleanly without leaking memory.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

- [ ] Register `devops-board` and `devops-view` markdown codeblock processors in plugin `onload()`
- [ ] Parse YAML options (`project`, `view`, `sprint`, `limit`) from codeblock text content with fallback defaults
- [ ] Mount Svelte view components inside Obsidian `MarkdownRenderChild` container
- [ ] Subscribe codeblock instances to `WorkItemManager` data change events for live reactivity
- [ ] Destroy Svelte component instance on `MarkdownRenderChild` unmount hook (`onunload`)
