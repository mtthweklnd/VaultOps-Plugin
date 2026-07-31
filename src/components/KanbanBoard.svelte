<script lang="ts">
	import type { WorkItem, WorkItemStatus, WorkItemType, WorkItemPriority } from '../types';
	import type { WorkItemManager } from '../models/WorkItemManager';

	export let items: WorkItem[] = [];
	export let statuses: WorkItemStatus[] = ['To Do', 'In Progress', 'In Review', 'Done'];
	export let workItemManager: WorkItemManager;

	let draggedItemId: string | null = null;
	let dragOverStatus: WorkItemStatus | null = null;

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
					<span class="devops-column-icon">{getStatusIcon(status)}</span>
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
										👤 {item.assignee}
									</span>
								{/if}
							</div>
						</div>
					</div>
				{/each}

				{#if columnItems.length === 0}
					<div class="devops-empty-column">No items</div>
				{/if}
			</div>
		</div>
	{/each}
</div>
