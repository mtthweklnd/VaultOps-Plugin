import { Plugin, WorkspaceLeaf } from 'obsidian';
import { DevOpsSettings, DEFAULT_SETTINGS } from './types';
import { WorkItemManager } from './models/WorkItemManager';
import { DevOpsViewContainer, VIEW_TYPE_DEVOPS } from './views/DevOpsViewContainer';
import { getDevOpsBasesViewRegistration, BASE_VIEW_TYPE_DEVOPS_KANBAN } from './views/DevOpsBasesView';
import { DevOpsSettingTab } from './settings';
import { CreateWorkItemModal } from './modals/CreateWorkItemModal';

export default class VaultDevOpsPlugin extends Plugin {
	settings: DevOpsSettings = DEFAULT_SETTINGS;
	workItemManager!: WorkItemManager;

	async onload(): Promise<void> {
		await this.loadSettings();

		// Initialize core data manager
		this.workItemManager = new WorkItemManager(
			this.app,
			this,
			() => this.settings,
			() => this.saveSettings()
		);

		// Register custom view
		this.registerView(
			VIEW_TYPE_DEVOPS,
			(leaf: WorkspaceLeaf) => new DevOpsViewContainer(leaf, this)
		);

		// Register Obsidian Bases custom view (Obsidian 1.8+ / 1.10+)
		if (typeof (this as any).registerBasesView === 'function') {
			(this as any).registerBasesView(
				BASE_VIEW_TYPE_DEVOPS_KANBAN,
				getDevOpsBasesViewRegistration(this)
			);
		}

		// Ribbon icon for quick access
		this.addRibbonIcon('kanban', 'Vault DevOps', () => {
			this.activateView();
		});

		// Command Palette commands
		this.addCommand({
			id: 'open-vault-devops-view',
			name: 'Open Vault DevOps Board',
			callback: () => {
				this.activateView();
			}
		});

		this.addCommand({
			id: 'create-work-item',
			name: 'Create Work Item',
			callback: () => {
				new CreateWorkItemModal(
					this.app,
					this,
					this.workItemManager,
					this.settings.defaultProjectKey
				).open();
			}
		});

		this.addCommand({
			id: 'reindex-vault-devops',
			name: 'Re-index Work Items',
			callback: () => {
				this.workItemManager.indexVault();
			}
		});

		// Settings Tab
		this.addSettingTab(new DevOpsSettingTab(this.app, this));

		// When layout is ready, index the vault
		this.app.workspace.onLayoutReady(() => {
			this.workItemManager.initialize();
		});
	}

	onunload(): void {
		// Clean up views
		this.app.workspace.detachLeavesOfType(VIEW_TYPE_DEVOPS);
	}

	async activateView(): Promise<void> {
		const { workspace } = this.app;

		let leaf: WorkspaceLeaf | null = null;
		const leaves = workspace.getLeavesOfType(VIEW_TYPE_DEVOPS);

		if (leaves.length > 0) {
			leaf = leaves[0];
		} else {
			leaf = workspace.getRightLeaf(false) || workspace.getLeaf(true);
			await leaf.setViewState({
				type: VIEW_TYPE_DEVOPS,
				active: true
			});
		}

		workspace.revealLeaf(leaf);
	}

	async loadSettings(): Promise<void> {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}
}
