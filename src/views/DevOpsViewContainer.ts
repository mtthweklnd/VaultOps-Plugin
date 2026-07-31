import { ItemView, WorkspaceLeaf } from 'obsidian';
import MainViewShell from '../components/MainViewShell.svelte';
import type VaultDevOpsPlugin from '../main';

export const VIEW_TYPE_DEVOPS = 'vault-devops-view';

export class DevOpsViewContainer extends ItemView {
	private plugin: VaultDevOpsPlugin;
	private component?: MainViewShell;

	constructor(leaf: WorkspaceLeaf, plugin: VaultDevOpsPlugin) {
		super(leaf);
		this.plugin = plugin;
	}

	getViewType(): string {
		return VIEW_TYPE_DEVOPS;
	}

	getDisplayText(): string {
		return 'Vault DevOps';
	}

	getIcon(): string {
		return 'kanban';
	}

	async onOpen(): Promise<void> {
		const container = this.contentEl;
		container.empty();
		container.addClass('vault-devops-container');

		this.component = new MainViewShell({
			target: container,
			props: {
				app: this.app,
				plugin: this.plugin,
				workItemManager: this.plugin.workItemManager
			}
		});
	}

	async onClose(): Promise<void> {
		if (this.component) {
			this.component.$destroy();
			this.component = undefined;
		}
	}
}
