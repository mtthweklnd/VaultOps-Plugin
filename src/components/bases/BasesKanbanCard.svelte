<script lang="ts">
	import type { App, TFile } from 'obsidian';
	import type { BasesEntry, BasesViewConfig, BasesPropertyId } from 'obsidian';

	export let app: App;
	export let entry: BasesEntry;
	export let config: BasesViewConfig | null = null;
	export let showProperties: boolean = true;
	export let groupPropId: BasesPropertyId | null = null;

	$: file = entry.file;
	$: fileName = file ? file.basename : 'Untitled Note';
	$: filePath = file ? file.path : '';

	// Extract display properties based on config order or entry
	$: propertyIds = config ? config.getOrder().slice(0, 4) : [];

	function openNote(e: MouseEvent | KeyboardEvent) {
		if (file && app) {
			const leaf = app.workspace.getLeaf(e.shiftKey || e.ctrlKey || e.metaKey);
			leaf.openFile(file);
		}
	}

	function handleDragStart(e: DragEvent) {
		if (e.dataTransfer && file) {
			e.dataTransfer.setData('text/plain', file.path);
			e.dataTransfer.effectAllowed = 'move';
		}
	}

	function formatVal(val: any): string {
		if (val === null || val === undefined) return '';
		if (typeof val === 'object') {
			if ('value' in val) return String(val.value);
			if ('name' in val) return String(val.name);
			if (Array.isArray(val)) return val.map(formatVal).join(', ');
		}
		return String(val);
	}

	function getPropValue(propId: BasesPropertyId): string {
		try {
			const raw = entry.getValue(propId);
			return formatVal(raw);
		} catch {
			return '';
		}
	}

	function getPropLabel(propId: BasesPropertyId): string {
		if (config) {
			return config.getDisplayName(propId);
		}
		const parts = propId.split('.');
		return parts.length > 1 ? parts[1] : propId;
	}
</script>

<div
	class="devops-bases-card"
	draggable="true"
	on:dragstart={handleDragStart}
	on:click={openNote}
	on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') openNote(e); }}
	role="button"
	tabindex="0"
	title="Click to open {filePath}"
>
	<div class="devops-bases-card-header">
		<span class="devops-bases-card-icon">📄</span>
		<span class="devops-bases-card-title">{fileName}</span>
		{#if groupPropId && getPropValue(groupPropId)}
			<span class="devops-bases-group-badge">{getPropValue(groupPropId)}</span>
		{/if}
	</div>

	<div class="devops-bases-card-path">{filePath}</div>

	{#if showProperties && propertyIds.length > 0}
		<div class="devops-bases-card-properties">
			{#each propertyIds as propId}
				{@const val = getPropValue(propId)}
				{#if val}
					<div class="devops-bases-card-prop">
						<span class="devops-bases-prop-name">{getPropLabel(propId)}:</span>
						<span class="devops-bases-prop-value">{val}</span>
					</div>
				{/if}
			{/each}
		</div>
	{/if}
</div>

<style>
	.devops-bases-card {
		background: var(--background-primary);
		border: 1px solid var(--border-color);
		border-radius: 6px;
		padding: 10px 12px;
		margin-bottom: 8px;
		cursor: pointer;
		transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
		user-select: none;
	}

	.devops-bases-card:hover {
		border-color: var(--interactive-accent);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
		transform: translateY(-1px);
	}

	.devops-bases-card:focus-visible {
		outline: 2px solid var(--interactive-accent);
	}

	.devops-bases-card-header {
		display: flex;
		align-items: center;
		gap: 6px;
		margin-bottom: 4px;
	}

	.devops-bases-card-icon {
		font-size: 14px;
	}

	.devops-bases-card-title {
		font-weight: 600;
		font-size: 13.5px;
		color: var(--text-normal);
		word-break: break-word;
		flex: 1;
	}

	.devops-bases-group-badge {
		font-size: 10.5px;
		font-weight: 500;
		background: var(--interactive-accent);
		color: var(--text-on-accent);
		padding: 2px 6px;
		border-radius: 4px;
		margin-left: auto;
	}

	.devops-bases-card-path {
		font-size: 11px;
		color: var(--text-muted);
		margin-bottom: 8px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.devops-bases-card-properties {
		display: flex;
		flex-direction: column;
		gap: 4px;
		border-top: 1px dashed var(--border-color);
		padding-top: 6px;
	}

	.devops-bases-card-prop {
		display: flex;
		justify-content: space-between;
		font-size: 11.5px;
	}

	.devops-bases-prop-name {
		color: var(--text-muted);
	}

	.devops-bases-prop-value {
		color: var(--text-normal);
		font-weight: 500;
		background: var(--background-secondary);
		padding: 1px 6px;
		border-radius: 4px;
	}
</style>
