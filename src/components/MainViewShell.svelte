<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { App } from 'obsidian';
	import type VaultDevOpsPlugin from '../main';
	import type { WorkItemManager } from '../models/WorkItemManager';
	import type { WorkItem, WorkItemType, WorkItemStatus } from '../types';

	import KanbanBoard from './KanbanBoard.svelte';
	import BacklogTree from './BacklogTree.svelte';
	import ProjectDashboard from './ProjectDashboard.svelte';
	import { CreateWorkItemModal } from '../modals/CreateWorkItemModal';

	export let app: App;
	export let plugin: VaultDevOpsPlugin;
	export let workItemManager: WorkItemManager;

	let activeView: 'kanban' | 'backlog' | 'dashboard' = 'kanban';
	let selectedProjectKey: string = 'ALL';
	let searchQuery: string = '';
	let selectedTypeFilter: string = 'all';
	let selectedStatusFilter: string = 'all';
	let selectedTagFilter: string = 'all';

	let items: WorkItem[] = [];
	let unsubscribe: (() => void) | null = null;

	function refreshItems() {
		items = workItemManager.getAllItems();
	}

	onMount(() => {
		refreshItems();
		unsubscribe = workItemManager.subscribe(() => {
			refreshItems();
		});
	});

	onDestroy(() => {
		if (unsubscribe) {
			unsubscribe();
		}
	});

	// Filtering logic
	$: projects = plugin.settings.projects;

	$: availableTags = Array.from(
		new Set(
			items
				.flatMap(i => i.tags || [])
				.map(t => (t.startsWith('#') ? t.slice(1) : t).trim())
				.filter(Boolean)
		)
	).sort();

	$: filteredItems = items.filter(item => {
		// Project filter
		if (selectedProjectKey !== 'ALL' && item.project !== selectedProjectKey) {
			return false;
		}

		// Type filter
		if (selectedTypeFilter !== 'all' && item.type !== selectedTypeFilter) {
			return false;
		}

		// Status filter
		if (selectedStatusFilter !== 'all' && item.status !== selectedStatusFilter) {
			return false;
		}

		// Tag filter
		if (selectedTagFilter !== 'all') {
			const hasTag = item.tags?.some(t => {
				const cleanTag = t.startsWith('#') ? t.slice(1) : t;
				return cleanTag.toLowerCase() === selectedTagFilter.toLowerCase();
			});
			if (!hasTag) return false;
		}

		// Search query filter
		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase().trim();
			const matchId = item.id.toLowerCase().includes(q);
			const matchTitle = item.title.toLowerCase().includes(q);
			const matchAssignee = item.assignee?.toLowerCase().includes(q);
			const matchTags = item.tags?.some(t => t.toLowerCase().includes(q));
			return matchId || matchTitle || matchAssignee || matchTags;
		}

		return true;
	});

	function openCreateModal(initialParentId?: string, initialType?: WorkItemType) {
		const targetProject = selectedProjectKey !== 'ALL' ? selectedProjectKey : plugin.settings.defaultProjectKey;
		new CreateWorkItemModal(
			app,
			plugin,
			workItemManager,
			targetProject,
			initialParentId,
			initialType
		).open();
	}
</script>

<div class="devops-main-shell">
	<!-- Top Navigation Bar -->
	<div class="devops-navbar">
		<div class="devops-navbar-left">
			<div class="devops-brand">
				<div class="devops-brand-icon">
					<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
						<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
					</svg>
				</div>
				<span class="devops-title">Vault DevOps</span>
			</div>

			<!-- Project Selector -->
			<select class="devops-project-select" bind:value={selectedProjectKey} aria-label="Select project filter">
				<option value="ALL">All Projects ({items.length})</option>
				{#each projects as proj}
					<option value={proj.key}>{proj.name} ({proj.key})</option>
				{/each}
			</select>
		</div>

		<!-- View Switcher -->
		<div class="devops-view-switcher" role="tablist" aria-label="View selection">
			<button 
				class="devops-tab-btn" 
				class:active={activeView === 'kanban'}
				on:click={() => activeView = 'kanban'}
				role="tab"
				aria-selected={activeView === 'kanban'}
			>
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>
				Kanban
			</button>

			<button 
				class="devops-tab-btn" 
				class:active={activeView === 'backlog'}
				on:click={() => activeView = 'backlog'}
				role="tab"
				aria-selected={activeView === 'backlog'}
			>
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
				Backlog
			</button>

			<button 
				class="devops-tab-btn" 
				class:active={activeView === 'dashboard'}
				on:click={() => activeView = 'dashboard'}
				role="tab"
				aria-selected={activeView === 'dashboard'}
			>
				<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
				Dashboard
			</button>
		</div>

		<div class="devops-navbar-right">
			<button class="devops-btn-primary" on:click={() => openCreateModal()}>
				+ New Item
			</button>
		</div>
	</div>

	<!-- Search & Filters Toolbar -->
	<div class="devops-toolbar" role="toolbar" aria-label="Filters and search">
		<!-- Live Search Input -->
		<div class="devops-search-box">
			<svg class="devops-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
			<input 
				type="text" 
				placeholder="Search items, titles, tags, assignee..." 
				bind:value={searchQuery}
				aria-label="Search work items"
			/>
			{#if searchQuery}
				<button class="devops-search-clear" on:click={() => searchQuery = ''} aria-label="Clear search">×</button>
			{/if}
		</div>

		<!-- Type Filter Pills (Desktop) -->
		<div class="devops-filter-pills" role="group" aria-label="Filter by type">
			<button 
				class="devops-pill" 
				class:active={selectedTypeFilter === 'all'}
				on:click={() => selectedTypeFilter = 'all'}
				aria-pressed={selectedTypeFilter === 'all'}
			>
				All
			</button>
			<button 
				class="devops-pill devops-pill-epic" 
				class:active={selectedTypeFilter === 'epic'}
				on:click={() => selectedTypeFilter = 'epic'}
				aria-pressed={selectedTypeFilter === 'epic'}
			>
				Epics
			</button>
			<button 
				class="devops-pill devops-pill-feature" 
				class:active={selectedTypeFilter === 'feature'}
				on:click={() => selectedTypeFilter = 'feature'}
				aria-pressed={selectedTypeFilter === 'feature'}
			>
				Features
			</button>
			<button 
				class="devops-pill devops-pill-story" 
				class:active={selectedTypeFilter === 'story'}
				on:click={() => selectedTypeFilter = 'story'}
				aria-pressed={selectedTypeFilter === 'story'}
			>
				Stories
			</button>
			<button 
				class="devops-pill devops-pill-task" 
				class:active={selectedTypeFilter === 'task'}
				on:click={() => selectedTypeFilter = 'task'}
				aria-pressed={selectedTypeFilter === 'task'}
			>
				Tasks
			</button>
			<button 
				class="devops-pill devops-pill-bug" 
				class:active={selectedTypeFilter === 'bug'}
				on:click={() => selectedTypeFilter = 'bug'}
				aria-pressed={selectedTypeFilter === 'bug'}
			>
				Bugs
			</button>
		</div>

		<!-- Type Filter Dropdown (Responsive Sidebar/Mobile) -->
		<div class="devops-filter-group devops-type-select-responsive-container">
			<select class="devops-type-select-responsive" bind:value={selectedTypeFilter} aria-label="Filter by type">
				<option value="all">Type: All</option>
				<option value="epic">Epics</option>
				<option value="feature">Features</option>
				<option value="story">Stories</option>
				<option value="task">Tasks</option>
				<option value="bug">Bugs</option>
			</select>
		</div>

		<!-- Status Filter Dropdown -->
		<div class="devops-filter-group">
			<select bind:value={selectedStatusFilter} aria-label="Filter by status">
				<option value="all">Status: All</option>
				{#each plugin.settings.statuses as status}
					<option value={status}>{status}</option>
				{/each}
			</select>
		</div>

		<!-- Tag Filter Dropdown -->
		<div class="devops-filter-group">
			<select bind:value={selectedTagFilter} aria-label="Filter by tag">
				<option value="all">Tag: All ({availableTags.length})</option>
				{#each availableTags as tag}
					<option value={tag}>#{tag}</option>
				{/each}
			</select>
		</div>
	</div>

	<!-- Main View Display Area -->
	<div class="devops-view-content">
		{#if activeView === 'kanban'}
			<KanbanBoard 
				items={filteredItems}
				statuses={plugin.settings.statuses}
				{workItemManager}
				{selectedProjectKey}
			/>
		{:else if activeView === 'backlog'}
			<BacklogTree 
				items={filteredItems}
				{workItemManager}
				onCreateChild={(parentId, parentType) => {
					const childType = parentType === 'epic' ? 'story' : 'task';
					openCreateModal(parentId, childType);
				}}
			/>
		{:else if activeView === 'dashboard'}
			<ProjectDashboard 
				items={filteredItems}
			/>
		{/if}
	</div>
</div>
