<script lang="ts">
	import type { WorkItem, WorkItemType, WorkItemStatus, WorkItemPriority } from '../types';

	export let items: WorkItem[] = [];

	$: totalCount = items.length;
	$: doneCount = items.filter(i => i.status === 'Done').length;
	$: inProgressCount = items.filter(i => i.status === 'In Progress' || i.status === 'In Review').length;
	$: todoCount = items.filter(i => i.status === 'To Do').length;
	$: completionRate = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
	$: totalEstimate = items.reduce((acc, item) => acc + (item.estimate || 0), 0);

	// Breakdown by type
	$: typesCount = {
		epic: items.filter(i => i.type === 'epic').length,
		feature: items.filter(i => i.type === 'feature').length,
		story: items.filter(i => i.type === 'story').length,
		task: items.filter(i => i.type === 'task').length,
		bug: items.filter(i => i.type === 'bug').length
	};

	// Breakdown by priority
	$: priorityCount = {
		Urgent: items.filter(i => i.priority === 'Urgent').length,
		High: items.filter(i => i.priority === 'High').length,
		Medium: items.filter(i => i.priority === 'Medium').length,
		Low: items.filter(i => i.priority === 'Low').length
	};

	function getPercent(count: number): number {
		return totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
	}
</script>

<div class="devops-dashboard">
	<!-- Summary Metric Cards -->
	<div class="devops-metrics-grid">
		<div class="devops-metric-card">
			<div class="devops-metric-icon">
				<svg class="devops-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path></svg>
			</div>
			<div class="devops-metric-value">{totalCount}</div>
			<div class="devops-metric-label">Total Work Items</div>
		</div>

		<div class="devops-metric-card accent-blue">
			<div class="devops-metric-icon">
				<svg class="devops-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
			</div>
			<div class="devops-metric-value">{inProgressCount}</div>
			<div class="devops-metric-label">Active / In Progress</div>
		</div>

		<div class="devops-metric-card accent-green">
			<div class="devops-metric-icon">
				<svg class="devops-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
			</div>
			<div class="devops-metric-value">{doneCount}</div>
			<div class="devops-metric-label">Completed Items</div>
		</div>

		<div class="devops-metric-card accent-purple">
			<div class="devops-metric-icon">
				<svg class="devops-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
			</div>
			<div class="devops-metric-value">{completionRate}%</div>
			<div class="devops-metric-label">Overall Completion</div>
		</div>

		{#if totalEstimate > 0}
			<div class="devops-metric-card accent-orange">
				<div class="devops-metric-icon">
					<svg class="devops-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
				</div>
				<div class="devops-metric-value">{totalEstimate}</div>
				<div class="devops-metric-label">Total Estimate (pts)</div>
			</div>
		{/if}
	</div>

	<!-- Distribution Charts / Breakdown Section -->
	<div class="devops-charts-grid">
		<!-- Status Breakdown -->
		<div class="devops-chart-card">
			<h4 class="devops-chart-title">
				<svg class="devops-icon" style="margin-right: 6px; vertical-align: text-bottom;" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
				Status Breakdown
			</h4>
			<div class="devops-bar-list">
				<div class="devops-bar-item">
					<div class="devops-bar-header">
						<span>To Do ({todoCount})</span>
						<span>{getPercent(todoCount)}%</span>
					</div>
					<div class="devops-bar-track">
						<div class="devops-bar-fill bg-gray" style="transform: scaleX({getPercent(todoCount) / 100})"></div>
					</div>
				</div>

				<div class="devops-bar-item">
					<div class="devops-bar-header">
						<span>In Progress / Review ({inProgressCount})</span>
						<span>{getPercent(inProgressCount)}%</span>
					</div>
					<div class="devops-bar-track">
						<div class="devops-bar-fill bg-blue" style="transform: scaleX({getPercent(inProgressCount) / 100})"></div>
					</div>
				</div>

				<div class="devops-bar-item">
					<div class="devops-bar-header">
						<span>Done ({doneCount})</span>
						<span>{getPercent(doneCount)}%</span>
					</div>
					<div class="devops-bar-track">
						<div class="devops-bar-fill bg-green" style="transform: scaleX({getPercent(doneCount) / 100})"></div>
					</div>
				</div>
			</div>
		</div>

		<!-- Work Item Type Breakdown -->
		<div class="devops-chart-card">
			<h4 class="devops-chart-title">
				<svg class="devops-icon" style="margin-right: 6px; vertical-align: text-bottom;" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
				Work Item Types
			</h4>
			<div class="devops-bar-list">
				{#each Object.entries(typesCount) as [type, count]}
					{#if count > 0 || totalCount === 0}
						<div class="devops-bar-item">
							<div class="devops-bar-header">
								<span class="capitalize">{type} ({count})</span>
								<span>{getPercent(count)}%</span>
							</div>
							<div class="devops-bar-track">
								<div class="devops-bar-fill devops-fill-{type}" style="transform: scaleX({getPercent(count) / 100})"></div>
							</div>
						</div>
					{/if}
				{/each}
			</div>
		</div>

		<!-- Priority Breakdown -->
		<div class="devops-chart-card">
			<h4 class="devops-chart-title">
				<svg class="devops-icon" style="margin-right: 6px; vertical-align: text-bottom;" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>
				Priority Breakdown
			</h4>
			<div class="devops-bar-list">
				{#each Object.entries(priorityCount) as [prio, count]}
					<div class="devops-bar-item">
						<div class="devops-bar-header">
							<span>{prio} ({count})</span>
							<span>{getPercent(count)}%</span>
						</div>
						<div class="devops-bar-track">
							<div class="devops-bar-fill devops-fill-prio-{prio.toLowerCase()}" style="transform: scaleX({getPercent(count) / 100})"></div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>
