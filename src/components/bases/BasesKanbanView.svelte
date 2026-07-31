<script lang="ts">
	import type { App, TFile } from 'obsidian';
	import type { BasesQueryResult, BasesViewConfig, BasesEntryGroup, BasesEntry, BasesPropertyId } from 'obsidian';
	import BasesKanbanCard from './BasesKanbanCard.svelte';
	import type VaultDevOpsPlugin from '../../main';

	export let app: App;
	export let data: BasesQueryResult | null = null;
	export let config: BasesViewConfig | null = null;
	export let plugin: VaultDevOpsPlugin | null = null;

	let dragOverColumn: string | null = null;

	$: showProperties = config ? Boolean(config.get('showCardProperties') ?? true) : true;
	$: configuredGroupProp = config ? config.getAsPropertyId('groupByProperty') : null;

	interface ColumnData {
		id: string;
		title: string;
		entries: BasesEntry[];
	}

	$: columns = computeColumns(data, configuredGroupProp);

	function formatVal(val: any): string {
		if (val === null || val === undefined) return 'Unassigned';
		if (typeof val === 'object') {
			if ('value' in val) return String(val.value);
			if ('name' in val) return String(val.name);
		}
		return String(val);
	}

	function computeColumns(queryResult: BasesQueryResult | null, customGroupProp: BasesPropertyId | null): ColumnData[] {
		if (!queryResult) return [];

		// Case 1: Base query itself has native groupedData
		if (queryResult.groupedData && queryResult.groupedData.length > 0) {
			return queryResult.groupedData.map((group: BasesEntryGroup, idx: number) => {
				const groupVal = group.hasKey() && group.key !== undefined ? formatVal(group.key) : 'Unassigned';
				return {
					id: `group-${idx}-${groupVal}`,
					title: groupVal,
					entries: group.entries || []
				};
			});
		}

		// Case 2: Configured group property selected by user in view options
		if (customGroupProp && queryResult.data && queryResult.data.length > 0) {
			const groupMap = new Map<string, BasesEntry[]>();
			for (const entry of queryResult.data) {
				let rawVal: any = null;
				try {
					rawVal = entry.getValue(customGroupProp);
				} catch {
					rawVal = null;
				}
				const keyStr = formatVal(rawVal);
				if (!groupMap.has(keyStr)) {
					groupMap.set(keyStr, []);
				}
				groupMap.get(keyStr)!.push(entry);
			}

			const result: ColumnData[] = [];
			for (const [title, entries] of groupMap.entries()) {
				result.push({
					id: `custom-${title}`,
					title,
					entries
				});
			}
			return result;
		}

		// Case 3: Default un-grouped list of all entries
		return [
			{
				id: 'all-items',
				title: 'All Items',
				entries: queryResult.data || []
			}
		];
	}

	function handleDragOver(e: DragEvent, columnId: string) {
		e.preventDefault();
		dragOverColumn = columnId;
		if (e.dataTransfer) {
			e.dataTransfer.dropEffect = 'move';
		}
	}

	function handleDragLeave() {
		dragOverColumn = null;
	}

	async function handleDrop(e: DragEvent, targetColumn: ColumnData) {
		e.preventDefault();
		dragOverColumn = null;
		if (!e.dataTransfer || !app) return;

		const filePath = e.dataTransfer.getData('text/plain');
		if (!filePath) return;

		const file = app.vault.getAbstractFileByPath(filePath);
		if (!file || !(file instanceof (window as any).Obsidian?.TFile || 'extension' in file)) return;

		const tfile = file as TFile;

		// Update file frontmatter if a custom group property is set
		if (configuredGroupProp) {
			const propName = configuredGroupProp.split('.')[1] || configuredGroupProp;
			try {
				await app.fileManager.processFrontMatter(tfile, (frontmatter) => {
					if (targetColumn.title === 'Unassigned') {
						delete frontmatter[propName];
					} else {
						frontmatter[propName] = targetColumn.title;
					}
				});
			} catch (err) {
				console.error('Failed to update frontmatter for file:', filePath, err);
			}
		} else if (plugin && plugin.workItemManager) {
			// Fallback to plugin WorkItemManager if status update fits standard statuses
			await plugin.workItemManager.updateWorkItemStatus(filePath, targetColumn.title as any);
		}
	}
</script>

<div class="devops-bases-kanban-root">
	{#if !data || columns.length === 0}
		<div class="devops-bases-empty">
			<span class="devops-bases-empty-icon">📊</span>
			<div class="devops-bases-empty-title">No Bases Data Available</div>
			<div class="devops-bases-empty-desc">Make sure your .base query returns valid notes or entries.</div>
		</div>
	{:else}
		<div class="devops-bases-kanban-board">
			{#each columns as column (column.id)}
				<div
					class="devops-bases-column"
					class:drag-over={dragOverColumn === column.id}
					role="region"
					aria-label={column.title}
					on:dragover={(e) => handleDragOver(e, column.id)}
					on:dragleave={handleDragLeave}
					on:drop={(e) => handleDrop(e, column)}
				>
					<div class="devops-bases-column-header">
						<div class="devops-bases-column-title-group">
							<span class="devops-bases-column-dot"></span>
							<span class="devops-bases-column-title">{column.title}</span>
						</div>
						<span class="devops-bases-column-count">{column.entries.length}</span>
					</div>

					<div class="devops-bases-column-content">
						{#each column.entries as entry (entry.file ? entry.file.path : Math.random())}
							<BasesKanbanCard
								{app}
								{entry}
								{config}
								{showProperties}
								groupPropId={configuredGroupProp}
							/>
						{/each}

						{#if column.entries.length === 0}
							<div class="devops-bases-column-empty">Drop items here</div>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.devops-bases-kanban-root {
		width: 100%;
		height: 100%;
		overflow-x: auto;
		overflow-y: hidden;
		padding: 12px;
		box-sizing: border-box;
		background: var(--background-primary-alt);
	}

	.devops-bases-kanban-board {
		display: flex;
		gap: 16px;
		height: 100%;
		align-items: flex-start;
	}

	.devops-bases-column {
		flex: 0 0 280px;
		width: 280px;
		max-height: 100%;
		display: flex;
		flex-direction: column;
		background: var(--background-secondary);
		border-radius: 8px;
		border: 1px solid var(--border-color);
		padding: 12px;
		box-sizing: border-box;
		transition: background-color 0.2s ease, border-color 0.2s ease;
	}

	.devops-bases-column.drag-over {
		background: var(--background-secondary-alt);
		border-color: var(--interactive-accent);
	}

	.devops-bases-column-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding-bottom: 10px;
		margin-bottom: 10px;
		border-bottom: 1px solid var(--border-color);
	}

	.devops-bases-column-title-group {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.devops-bases-column-dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--interactive-accent);
	}

	.devops-bases-column-title {
		font-weight: 600;
		font-size: 14px;
		color: var(--text-normal);
	}

	.devops-bases-column-count {
		font-size: 12px;
		font-weight: 600;
		color: var(--text-muted);
		background: var(--background-primary);
		padding: 2px 8px;
		border-radius: 12px;
		border: 1px solid var(--border-color);
	}

	.devops-bases-column-content {
		flex: 1;
		overflow-y: auto;
		min-height: 80px;
		padding-right: 2px;
	}

	.devops-bases-column-empty {
		font-size: 12px;
		color: var(--text-muted);
		text-align: center;
		padding: 24px 12px;
		border: 1px dashed var(--border-color);
		border-radius: 6px;
		margin-top: 4px;
	}

	.devops-bases-empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		color: var(--text-muted);
		text-align: center;
	}

	.devops-bases-empty-icon {
		font-size: 32px;
		margin-bottom: 8px;
	}

	.devops-bases-empty-title {
		font-weight: 600;
		font-size: 16px;
		color: var(--text-normal);
	}

	.devops-bases-empty-desc {
		font-size: 13px;
		margin-top: 4px;
	}
</style>
