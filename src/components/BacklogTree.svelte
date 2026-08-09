<script lang="ts">
	import type { WorkItem, WorkItemType } from '../types';
	import type { WorkItemManager } from '../models/WorkItemManager';

	export let items: WorkItem[] = [];
	export let workItemManager: WorkItemManager;
	export let onCreateChild: (parentId: string, parentType: WorkItemType) => void;

	let expandedNodes: Record<string, boolean> = {};

	function toggleNode(nodeId: string) {
		expandedNodes[nodeId] = !expandedNodes[nodeId];
		expandedNodes = { ...expandedNodes };
	}

	function isExpanded(nodeId: string): boolean {
		return expandedNodes[nodeId] !== false; // expanded by default
	}

	function openItem(item: WorkItem) {
		workItemManager.openWorkItemFile(item.filePath);
	}

	// Hierarchy calculation
	$: epics = items.filter(i => i.type === 'epic');
	$: orphanStories = items.filter(i => (i.type === 'story' || i.type === 'feature') && !i.parentId);
	$: orphanTasks = items.filter(i => (i.type === 'task' || i.type === 'bug') && !i.parentId);

	function getChildStories(epicId: string): WorkItem[] {
		return items.filter(i => i.parentId === epicId || i.parentId === `[[${epicId}]]`);
	}

	function getChildTasks(parentId: string): WorkItem[] {
		return items.filter(i => i.parentId === parentId || i.parentId === `[[${parentId}]]`);
	}

	function getProgressRollup(item: WorkItem): { total: number; done: number; percent: number } {
		const children = getChildTasks(item.id);
		if (children.length === 0) return { total: 0, done: 0, percent: 0 };
		const done = children.filter(c => c.status === 'Done').length;
		return {
			total: children.length,
			done,
			percent: Math.round((done / children.length) * 100)
		};
	}

	function getTypeBadgeClass(type: WorkItemType): string {
		switch (type) {
			case 'epic': return 'devops-badge-epic';
			case 'feature': return 'devops-badge-feature';
			case 'story': return 'devops-badge-story';
			case 'task': return 'devops-badge-task';
			case 'bug': return 'devops-badge-bug';
			default: return '';
		}
	}
</script>

<div class="devops-backlog-tree">
	<div class="devops-tree-header">
		<span>Hierarchy & Rollup Backlog</span>
		<span class="devops-tree-count">{items.length} Total Items</span>
	</div>

	<div class="devops-tree-list">
		<!-- Epics Tier -->
		{#each epics as epic (epic.id)}
			{@const children = getChildStories(epic.id)}
			{@const rollup = getProgressRollup(epic)}
			<div class="devops-tree-node epic-node">
				<div class="devops-tree-row">
					<button 
						class="devops-node-toggle" 
						on:click={() => toggleNode(epic.id)}
						aria-expanded={isExpanded(epic.id)}
						aria-label={isExpanded(epic.id) ? "Collapse Epic" : "Expand Epic"}
					>
						{isExpanded(epic.id) ? '▼' : '▶'}
					</button>

					<span class="devops-badge {getTypeBadgeClass(epic.type)}">{epic.type}</span>
					<span class="devops-node-id">{epic.id}</span>
					
					<span 
						class="devops-node-title" 
						on:click={() => openItem(epic)}
						on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') openItem(epic); }}
						role="button"
						tabindex="0"
					>
						{epic.title}
					</span>

					{#if rollup.total > 0}
						<div class="devops-rollup-bar" title="{rollup.done}/{rollup.total} completed">
							<div class="devops-rollup-fill" style="transform: scaleX({rollup.percent / 100})"></div>
							<span class="devops-rollup-text">{rollup.percent}%</span>
						</div>
					{/if}

					<span class="devops-status-tag">{epic.status}</span>

					<button 
						class="devops-btn-xs" 
						title="Add child item to {epic.id}"
						on:click={() => onCreateChild(epic.id, 'epic')}
					>
						+ Child
					</button>
				</div>

				{#if isExpanded(epic.id)}
					<div class="devops-tree-children">
						{#each children as story (story.id)}
							{@const tasks = getChildTasks(story.id)}
							{@const storyRollup = getProgressRollup(story)}
							<div class="devops-tree-node story-node">
								<div class="devops-tree-row">
									<button 
										class="devops-node-toggle" 
										on:click={() => toggleNode(story.id)}
										aria-expanded={isExpanded(story.id)}
										aria-label={isExpanded(story.id) ? "Collapse Story" : "Expand Story"}
									>
										{isExpanded(story.id) ? '▼' : '▶'}
									</button>

									<span class="devops-badge {getTypeBadgeClass(story.type)}">{story.type}</span>
									<span class="devops-node-id">{story.id}</span>

									<span 
										class="devops-node-title" 
										on:click={() => openItem(story)}
										on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') openItem(story); }}
										role="button"
										tabindex="0"
									>
										{story.title}
									</span>

									{#if storyRollup.total > 0}
										<div class="devops-rollup-bar" title="{storyRollup.done}/{storyRollup.total} completed">
											<div class="devops-rollup-fill" style="transform: scaleX({storyRollup.percent / 100})"></div>
											<span class="devops-rollup-text">{storyRollup.percent}%</span>
										</div>
									{/if}

									<span class="devops-status-tag">{story.status}</span>

									<button 
										class="devops-btn-xs" 
										title="Add subtask to {story.id}"
										on:click={() => onCreateChild(story.id, 'story')}
									>
										+ Task
									</button>
								</div>

								{#if isExpanded(story.id)}
									<div class="devops-tree-children">
										{#each tasks as task (task.id)}
											<div class="devops-tree-row task-row">
												<span class="devops-tree-indent"></span>
												<span class="devops-badge {getTypeBadgeClass(task.type)}">{task.type}</span>
												<span class="devops-node-id">{task.id}</span>
												<span 
													class="devops-node-title" 
													on:click={() => openItem(task)}
													on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') openItem(task); }}
													role="button"
													tabindex="0"
												>
													{task.title}
												</span>
												<span class="devops-status-tag">{task.status}</span>
											</div>
										{/each}
									</div>
								{/if}
							</div>
						{/each}
					</div>
				{/if}
			</div>
		{/each}

		<!-- Standalone / Unparented Items -->
		{#if orphanStories.length > 0}
			<div class="devops-tree-section-header">Standalone Stories & Features</div>
			{#each orphanStories as item (item.id)}
				<div class="devops-tree-row">
					<span class="devops-badge {getTypeBadgeClass(item.type)}">{item.type}</span>
					<span class="devops-node-id">{item.id}</span>
					<span class="devops-node-title" on:click={() => openItem(item)} on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') openItem(item); }} role="button" tabindex="0">
						{item.title}
					</span>
					<span class="devops-status-tag">{item.status}</span>
				</div>
			{/each}
		{/if}

		{#if orphanTasks.length > 0}
			<div class="devops-tree-section-header">Standalone Tasks & Bugs</div>
			{#each orphanTasks as item (item.id)}
				<div class="devops-tree-row">
					<span class="devops-badge {getTypeBadgeClass(item.type)}">{item.type}</span>
					<span class="devops-node-id">{item.id}</span>
					<span class="devops-node-title" on:click={() => openItem(item)} on:keydown={(e) => { if (e.key === 'Enter' || e.key === ' ') openItem(item); }} role="button" tabindex="0">
						{item.title}
					</span>
					<span class="devops-status-tag">{item.status}</span>
				</div>
			{/each}
		{/if}

		{#if items.length === 0}
			<div class="devops-empty-tree">No work items found for current selection.</div>
		{/if}
	</div>
</div>
