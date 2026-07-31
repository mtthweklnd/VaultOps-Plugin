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
				<span class="devops-brand-icon">⚡</span>
				<span class="devops-title">Vault DevOps</span>
			</div>

			<!-- Project Selector -->
			<select class="devops-project-select" bind:value={selectedProjectKey}>
				<option value="ALL">All Projects ({items.length})</option>
				{#each projects as proj}
					<option value={proj.key}>{proj.name} ({proj.key})</option>
				{/each}
			</select>
		</div>

		<!-- View Switcher -->
		<div class="devops-view-switcher">
			<button 
				class="devops-tab-btn" 
				class:active={activeView === 'kanban'}
				on:click={() => activeView = 'kanban'}
			>
				📋 Kanban
			</button>

			<button 
				class="devops-tab-btn" 
				class:active={activeView === 'backlog'}
				on:click={() => activeView = 'backlog'}
			>
				🌳 Backlog
			</button>

			<button 
				class="devops-tab-btn" 
				class:active={activeView === 'dashboard'}
				on:click={() => activeView = 'dashboard'}
			>
				📊 Dashboard
			</button>
		</div>

		<div class="devops-navbar-right">
			<button class="devops-btn-primary" on:click={() => openCreateModal()}>
				+ New Item
			</button>
		</div>
	</div>

	<!-- Search & Filters Toolbar -->
	<div class="devops-toolbar">
		<!-- Live Search Input -->
		<div class="devops-search-box">
			<span class="devops-search-icon">🔍</span>
			<input 
				type="text" 
				placeholder="Search items, titles, tags, assignee..." 
				bind:value={searchQuery}
			/>
			{#if searchQuery}
				<button class="devops-search-clear" on:click={() => searchQuery = ''}>×</button>
			{/if}
		</div>

		<!-- Type Filter Pills -->
		<div class="devops-filter-pills">
			<button 
				class="devops-pill" 
				class:active={selectedTypeFilter === 'all'}
				on:click={() => selectedTypeFilter = 'all'}
			>
				All
			</button>
			<button 
				class="devops-pill devops-pill-epic" 
				class:active={selectedTypeFilter === 'epic'}
				on:click={() => selectedTypeFilter = 'epic'}
			>
				Epics
			</button>
			<button 
				class="devops-pill devops-pill-feature" 
				class:active={selectedTypeFilter === 'feature'}
				on:click={() => selectedTypeFilter = 'feature'}
			>
				Features
			</button>
			<button 
				class="devops-pill devops-pill-story" 
				class:active={selectedTypeFilter === 'story'}
				on:click={() => selectedTypeFilter = 'story'}
			>
				Stories
			</button>
			<button 
				class="devops-pill devops-pill-task" 
				class:active={selectedTypeFilter === 'task'}
				on:click={() => selectedTypeFilter = 'task'}
			>
				Tasks
			</button>
			<button 
				class="devops-pill devops-pill-bug" 
				class:active={selectedTypeFilter === 'bug'}
				on:click={() => selectedTypeFilter = 'bug'}
			>
				Bugs
			</button>
		</div>

		<!-- Status Filter Dropdown -->
		<div class="devops-filter-group">
			<select bind:value={selectedStatusFilter}>
				<option value="all">Status: All</option>
				{#each plugin.settings.statuses as status}
					<option value={status}>{status}</option>
				{/each}
			</select>
		</div>

		<!-- Tag Filter Dropdown -->
		<div class="devops-filter-group">
			<select bind:value={selectedTagFilter}>
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
