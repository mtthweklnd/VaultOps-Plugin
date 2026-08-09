<script lang="ts">
	import type { WorkItem, WorkItemStatus, WorkItemType, WorkItemPriority } from '../types';
	import type { WorkItemManager } from '../models/WorkItemManager';

	export let items: WorkItem[] = [];
	export let statuses: WorkItemStatus[] = ['To Do', 'In Progress', 'In Review', 'Done'];
	export let workItemManager: WorkItemManager;
	export let selectedProjectKey: string = 'ALL';

	let draggedItemId: string | null = null;
	let dragOverStatus: WorkItemStatus | null = null;

	// Inline quick-add state
	let quickAddStatus: WorkItemStatus | null = null;
	let quickAddTitle: string = '';
	let quickAddType: WorkItemType = 'task';

	function focusOnMount(node: HTMLInputElement) {
		node.focus();
	}

	function startQuickAdd(status: WorkItemStatus) {
		quickAddStatus = status;
		quickAddTitle = '';
		quickAddType = 'task';
	}

	function cancelQuickAdd() {
		quickAddStatus = null;
		quickAddTitle = '';
	}

	async function submitQuickAdd(status: WorkItemStatus) {
		if (!quickAddTitle.trim()) return;
		const projectKey = (selectedProjectKey && selectedProjectKey !== 'ALL')
			? selectedProjectKey
			: workItemManager.getSettings().defaultProjectKey;

		await workItemManager.createWorkItem({
			title: quickAddTitle.trim(),
			status,
			type: quickAddType,
			projectKey
		});

		quickAddTitle = '';
		// Keep quickAddStatus active for fast consecutive entry
	}

	function handleDragStart(event: DragEvent, item: WorkItem) {
		draggedItemId = item.id;
		if (event.dataTransfer) {
			event.dataTransfer.setData('text/plain', item.filePath);
			event.dataTransfer.effectAllowed = 'move';
		}
	}

	function handleDragOver(event: DragEvent, status: WorkItemStatus) {
		event.preventDefault();
		dragOverStatus = status;
		if (event.dataTransfer) {
			event.dataTransfer.dropEffect = 'move';
		}
	}

	function handleDragLeave() {
		dragOverStatus = null;
	}

	async function handleDrop(event: DragEvent, newStatus: WorkItemStatus) {
		event.preventDefault();
		dragOverStatus = null;
		if (event.dataTransfer) {
			const filePath = event.dataTransfer.getData('text/plain');
			if (filePath) {
				await workItemManager.updateWorkItemStatus(filePath, newStatus);
			}
		}
	}

	function getTypeBadgeClass(type: WorkItemType): string {
		switch (type) {
			case 'epic': return 'devops-badge-epic';
			case 'feature': return 'devops-badge-feature';
			case 'story': return 'devops-badge-story';
			case 'task': return 'devops-badge-task';
			case 'bug': return 'devops-badge-bug';
			default: return 'devops-badge-default';
		}
	}

	function getPriorityClass(priority: WorkItemPriority): string {
		switch (priority) {
			case 'Urgent': return 'devops-priority-urgent';
			case 'High': return 'devops-priority-high';
			case 'Medium': return 'devops-priority-medium';
			case 'Low': return 'devops-priority-low';
			default: return '';
		}
	}

	function getStatusIcon(status: WorkItemStatus): string {
		switch (status) {
			case 'To Do': return '📝';
			case 'In Progress': return '⚡';
			case 'In Review': return '👁️';
			case 'Done': return '✅';
			default: return '📌';
		}
	}

	function openItem(item: WorkItem) {
		workItemManager.openWorkItemFile(item.filePath);
	}
</script>

<div class="devops-kanban-board">
	{#each statuses as status}
		{@const columnItems = items.filter(i => i.status === status)}
		<div 
			class="devops-kanban-column" 
			class:drag-over={dragOverStatus === status}
			role="region"
			aria-label={status}
			on:dragover={(e) => handleDragOver(e, status)}
			on:dragleave={handleDragLeave}
			on:drop={(e) => handleDrop(e, status)}
		>
			<div class="devops-column-header">
				<div class="devops-column-title-group">
					<span class="devops-column-icon">
						{#if status === 'To Do'}
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
						{:else if status === 'In Progress'}
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
						{:else if status === 'In Review'}
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
						{:else if status === 'Done'}
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg>
						{:else}
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
						{/if}
					</span>
					<span class="devops-column-title">{status}</span>
				</div>
				<span class="devops-column-count">{columnItems.length}</span>
			</div>

			<div class="devops-column-content">
				{#each columnItems as item (item.filePath)}
					<div 
						class="devops-kanban-card"
						draggable="true"
						on:dragstart={(e) => handleDragStart(e, item)}
						on:click={() => openItem(item)}
						on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') openItem(item); }}
						role="button"
						tabindex="0"
					>
						<div class="devops-card-header">
							<span class="devops-badge {getTypeBadgeClass(item.type)}">{item.type}</span>
							<span class="devops-card-id">{item.id}</span>
						</div>

						<div class="devops-card-title">{item.title}</div>

						{#if item.parentId}
							<div class="devops-card-parent">
								<span class="devops-parent-icon">↳</span> {item.parentId}
							</div>
						{/if}

						{#if item.tags && item.tags.length > 0}
							<div class="devops-card-tags">
								{#each item.tags as tag}
									<span class="devops-card-tag">{tag.startsWith('#') ? tag : '#' + tag}</span>
								{/each}
							</div>
						{/if}

						<div class="devops-card-footer">
							<div class="devops-card-footer-left">
								<span class="devops-priority-pill {getPriorityClass(item.priority)}">
									{item.priority}
								</span>

								{#if item.estimate !== undefined}
									<span class="devops-card-estimate">{item.estimate} pts</span>
								{/if}
							</div>

							<div class="devops-card-footer-right">
								{#if item.assignee}
									<span class="devops-card-assignee" title="Assignee: {item.assignee}">
										@{item.assignee}
									</span>
								{/if}
							</div>
						</div>
					</div>
				{/each}

				{#if columnItems.length === 0 && quickAddStatus !== status}
					<div class="devops-empty-column">No items</div>
				{/if}

				<!-- Inline Quick Add Input Bar -->
				{#if quickAddStatus === status}
					<div class="devops-quick-add-form">
						<input 
							type="text" 
							class="devops-quick-add-input"
							placeholder="Task title... (Enter to add)"
							bind:value={quickAddTitle}
							on:keydown={(e) => {
								if (e.key === 'Enter') submitQuickAdd(status);
								if (e.key === 'Escape') cancelQuickAdd();
							}}
							use:focusOnMount
							aria-label="Quick add task title"
						/>
						<div class="devops-quick-add-actions">
							<select class="devops-quick-add-type" bind:value={quickAddType} aria-label="Work item type selection">
								<option value="task">Task</option>
								<option value="story">Story</option>
								<option value="bug">Bug</option>
								<option value="feature">Feature</option>
								<option value="epic">Epic</option>
							</select>
							<button class="devops-btn-xs devops-btn-save" on:click={() => submitQuickAdd(status)}>Add</button>
							<button class="devops-btn-xs devops-btn-cancel" on:click={cancelQuickAdd} aria-label="Cancel quick add">×</button>
						</div>
					</div>
				{:else}
					<button class="devops-column-quick-add-btn" on:click={() => startQuickAdd(status)}>
						+ Add Card
					</button>
				{/if}
			</div>
		</div>
	{/each}
</div>

