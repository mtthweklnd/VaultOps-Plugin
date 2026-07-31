# Vault DevOps - Project Roadmap

## Overview
`vault-devops` is an Obsidian plugin providing JIRA/Azure DevOps style project management directly inside Obsidian vaults. 

## Epics & Features

### Epic 1: Custom Obsidian Bases View Integration
Integrate Obsidian 1.8+ Bases API to allow users to create and render custom Bases views (`.base` files) for Vault DevOps work items and notes.

- [ ] **Feature 1.1: Custom Bases View Registration & Rendering Engine**
  - Register a custom Bases view type using `registerBasesView`.
  - Render Bases query results (`BasesQueryResult`, `BasesEntry`, `BasesEntryGroup`) dynamically.
  - Support configurable view options (e.g., column mapping, status grouping, cards/compact mode).
  - Handle real-time query updates and data re-rendering.
