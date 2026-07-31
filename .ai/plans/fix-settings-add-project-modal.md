# Implementation Plan - Fix Settings & Add Project Dialog

Review settings tab implementation to resolve the issue where clicking "Add Project" did nothing, and enhance project management UI and validation.

## Root Cause

The plugin's settings tab (`src/settings.ts`) attempted to use native browser functions (`window.prompt()` and `window.alert()`) to prompt users for project details (Key, Name, Folder) and alert on errors. In Obsidian's Electron environment, `window.prompt()` is not implemented/supported in renderer processes and immediately returns `null`. This caused the `onClick` handler to abort early (`if (!key) return;`), resulting in nothing happening when the user clicked "Add Project" or "Edit Key".

## Proposed Changes

### 1. New Modal Component: `ProjectModal`
#### [NEW] [ProjectModal.ts](file:///c:/Users/mtthw/Vaults/test-vault/.obsidian/plugins/vault-devops/src/modals/ProjectModal.ts)
- Create a dedicated Obsidian `Modal` class for adding or editing a project (`ProjectConfig`).
- Fields:
  - **Project Key**: uppercase string, alphanumeric prefix (e.g. `CORE`). Validates that the key is unique and non-empty.
  - **Project Name**: human-readable name (e.g. `Core Platform`).
  - **Folder Path**: target vault folder for work items (e.g. `DevOps/CORE`). Auto-suggests based on Key.
  - **Next ID**: starting integer sequence number (defaults to `101`).
- Validates input and provides inline warning/Notice if validation fails (e.g. duplicate key).

### 2. Refactor `DevOpsSettingTab`
#### [MODIFY] [settings.ts](file:///c:/Users/mtthw/Vaults/test-vault/.obsidian/plugins/vault-devops/src/settings.ts)
- Replace calls to `prompt()` and `alert()` with `ProjectModal` and Obsidian `Notice`.
- Add a **Default Project** dropdown setting allowing users to select which project is used by default when creating work items.
- Enhance the Projects list section:
  - Add **Edit Project** button opening `ProjectModal` in edit mode.
  - Fix **Delete** button: prevent deletion if only one project remains using `new Notice(...)`, and update `defaultProjectKey` if the default project was deleted.
  - Add **Add Project** button opening `ProjectModal` in add mode.

### 3. Build & Verify
- Run `npm run build` to compile TypeScript to `main.js`.

## Verification Plan

### Automated Tests
- Run `npm run build` to verify clean compilation with TypeScript and esbuild.

### Manual Verification
- Test opening plugin Settings in Obsidian.
- Click "Add Project" -> Verify `ProjectModal` pops up.
- Enter new project details (e.g., Key: `TEST`, Name: `Test Project`, Folder: `DevOps/TEST`) and submit -> Verify project appears in the settings list and `data.json` is updated.
- Verify Default Project dropdown lets user select `TEST`.
- Test editing an existing project -> Verify changes update properly.
- Test deleting a project -> Verify Notice appears if deleting last project, and default project falls back safely if default project is removed.
