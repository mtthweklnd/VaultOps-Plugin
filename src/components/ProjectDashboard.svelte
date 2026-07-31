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
			<div class="devops-metric-icon">📋</div>
			<div class="devops-metric-value">{totalCount}</div>
			<div class="devops-metric-label">Total Work Items</div>
		</div>

		<div class="devops-metric-card accent-blue">
			<div class="devops-metric-icon">⚡</div>
			<div class="devops-metric-value">{inProgressCount}</div>
			<div class="devops-metric-label">Active / In Progress</div>
		</div>

		<div class="devops-metric-card accent-green">
			<div class="devops-metric-icon">✅</div>
			<div class="devops-metric-value">{doneCount}</div>
			<div class="devops-metric-label">Completed Items</div>
		</div>

		<div class="devops-metric-card accent-purple">
			<div class="devops-metric-icon">📈</div>
			<div class="devops-metric-value">{completionRate}%</div>
			<div class="devops-metric-label">Overall Completion</div>
		</div>

		{#if totalEstimate > 0}
			<div class="devops-metric-card accent-orange">
				<div class="devops-metric-icon">⏱️</div>
				<div class="devops-metric-value">{totalEstimate}</div>
				<div class="devops-metric-label">Total Estimate (pts)</div>
			</div>
		{/if}
	</div>

	<!-- Distribution Charts / Breakdown Section -->
	<div class="devops-charts-grid">
		<!-- Status Breakdown -->
		<div class="devops-chart-card">
			<h4 class="devops-chart-title">📊 Status Breakdown</h4>
			<div class="devops-bar-list">
				<div class="devops-bar-item">
					<div class="devops-bar-header">
						<span>To Do ({todoCount})</span>
						<span>{getPercent(todoCount)}%</span>
					</div>
					<div class="devops-bar-track">
						<div class="devops-bar-fill bg-gray" style="width: {getPercent(todoCount)}%"></div>
					</div>
				</div>

				<div class="devops-bar-item">
					<div class="devops-bar-header">
						<span>In Progress / Review ({inProgressCount})</span>
						<span>{getPercent(inProgressCount)}%</span>
					</div>
					<div class="devops-bar-track">
						<div class="devops-bar-fill bg-blue" style="width: {getPercent(inProgressCount)}%"></div>
					</div>
				</div>

				<div class="devops-bar-item">
					<div class="devops-bar-header">
						<span>Done ({doneCount})</span>
						<span>{getPercent(doneCount)}%</span>
					</div>
					<div class="devops-bar-track">
						<div class="devops-bar-fill bg-green" style="width: {getPercent(doneCount)}%"></div>
					</div>
				</div>
			</div>
		</div>

		<!-- Work Item Type Breakdown -->
		<div class="devops-chart-card">
			<h4 class="devops-chart-title">🏷️ Work Item Types</h4>
			<div class="devops-bar-list">
				{#each Object.entries(typesCount) as [type, count]}
					{#if count > 0 || totalCount === 0}
						<div class="devops-bar-item">
							<div class="devops-bar-header">
								<span class="capitalize">{type} ({count})</span>
								<span>{getPercent(count)}%</span>
							</div>
							<div class="devops-bar-track">
								<div class="devops-bar-fill devops-fill-{type}" style="width: {getPercent(count)}%"></div>
							</div>
						</div>
					{/if}
				{/each}
			</div>
		</div>

		<!-- Priority Breakdown -->
		<div class="devops-chart-card">
			<h4 class="devops-chart-title">🔥 Priority Breakdown</h4>
			<div class="devops-bar-list">
				{#each Object.entries(priorityCount) as [prio, count]}
					<div class="devops-bar-item">
						<div class="devops-bar-header">
							<span>{prio} ({count})</span>
							<span>{getPercent(count)}%</span>
						</div>
						<div class="devops-bar-track">
							<div class="devops-bar-fill devops-fill-prio-{prio.toLowerCase()}" style="width: {getPercent(count)}%"></div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>
