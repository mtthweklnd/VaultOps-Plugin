import { BasesView, QueryController, BasesViewRegistration, BasesViewConfig } from 'obsidian';
import BasesKanbanView from '../components/bases/BasesKanbanView.svelte';
import type VaultDevOpsPlugin from '../main';

export const BASE_VIEW_TYPE_DEVOPS_KANBAN = 'devops-kanban';

export class DevOpsBasesView extends BasesView {
	type = BASE_VIEW_TYPE_DEVOPS_KANBAN;
	containerEl: HTMLElement;
	private plugin: VaultDevOpsPlugin;
	private svelteComponent: BasesKanbanView | null = null;

	constructor(controller: QueryController, containerEl: HTMLElement, plugin: VaultDevOpsPlugin) {
		super(controller);
		this.containerEl = containerEl;
		this.plugin = plugin;
	}

	onload(): void {
		this.containerEl.empty();
		this.containerEl.addClass('devops-bases-container');

		this.svelteComponent = new BasesKanbanView({
			target: this.containerEl,
			props: {
				app: this.app,
				data: this.data,
				config: this.config,
				plugin: this.plugin
			}
		});
	}

	onDataUpdated(): void {
		if (this.svelteComponent) {
			this.svelteComponent.$set({
				data: this.data,
				config: this.config
			});
		} else {
			this.onload();
		}
	}

	onunload(): void {
		if (this.svelteComponent) {
			this.svelteComponent.$destroy();
			this.svelteComponent = null;
		}
	}
}

/**
 * Returns the registration configuration object for Obsidian registerBasesView API.
 */
export function getDevOpsBasesViewRegistration(plugin: VaultDevOpsPlugin): BasesViewRegistration {
	return {
		name: 'DevOps Kanban',
		icon: 'kanban',
		factory: (controller: QueryController, containerEl: HTMLElement) => {
			return new DevOpsBasesView(controller, containerEl, plugin);
		},
		options: (_config: BasesViewConfig) => {
			return [
				{
					key: 'groupByProperty',
					type: 'property',
					displayName: 'Group by Property'
				},
				{
					key: 'showCardProperties',
					type: 'toggle',
					displayName: 'Show Card Properties',
					default: true
				}
			];
		}
	};
}
