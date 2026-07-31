import { App, Modal, Notice, Setting } from 'obsidian';
import type VaultDevOpsPlugin from '../main';
import type { WorkItemManager } from '../models/WorkItemManager';
import type { WorkItemType, WorkItemStatus, WorkItemPriority } from '../types';

export class CreateWorkItemModal extends Modal {
	private plugin: VaultDevOpsPlugin;
	private workItemManager: WorkItemManager;

	private title: string = '';
	private type: WorkItemType = 'story';
	private projectKey: string;
	private status: WorkItemStatus = 'To Do';
	private priority: WorkItemPriority = 'Medium';
	private parentId: string = '';
	private assignee: string = '';
	private estimate?: number;
	private description: string = '';

	constructor(
		app: App,
		plugin: VaultDevOpsPlugin,
		workItemManager: WorkItemManager,
		initialProjectKey?: string,
		initialParentId?: string,
		initialType?: WorkItemType
	) {
		super(app);
		this.plugin = plugin;
		this.workItemManager = workItemManager;
		this.projectKey = initialProjectKey || plugin.settings.defaultProjectKey;
		if (initialParentId) this.parentId = initialParentId;
		if (initialType) this.type = initialType;
	}

	onOpen(): void {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass('devops-modal-container');

		contentEl.createEl('h2', { text: 'Create New Work Item' });

		// Title
		new Setting(contentEl)
			.setName('Title')
			.setDesc('Brief summary of the work item')
			.addText(text => text
				.setPlaceholder('e.g. Implement user authentication UI')
				.setValue(this.title)
				.onChange(val => this.title = val));

		// Project
		new Setting(contentEl)
			.setName('Project')
			.addDropdown(dropdown => {
				this.plugin.settings.projects.forEach(p => {
					dropdown.addOption(p.key, `${p.name} (${p.key})`);
				});
				dropdown.setValue(this.projectKey);
				dropdown.onChange(val => this.projectKey = val);
			});

		// Work Item Type
		new Setting(contentEl)
			.setName('Type')
			.addDropdown(dropdown => {
				dropdown.addOption('epic', 'Epic');
				dropdown.addOption('feature', 'Feature');
				dropdown.addOption('story', 'Story');
				dropdown.addOption('task', 'Task');
				dropdown.addOption('bug', 'Bug');
				dropdown.setValue(this.type);
				dropdown.onChange(val => this.type = val as WorkItemType);
			});

		// Status
		new Setting(contentEl)
			.setName('Initial Status')
			.addDropdown(dropdown => {
				this.plugin.settings.statuses.forEach(s => {
					dropdown.addOption(s, s);
				});
				dropdown.setValue(this.status);
				dropdown.onChange(val => this.status = val as WorkItemStatus);
			});

		// Priority
		new Setting(contentEl)
			.setName('Priority')
			.addDropdown(dropdown => {
				dropdown.addOption('Low', 'Low');
				dropdown.addOption('Medium', 'Medium');
				dropdown.addOption('High', 'High');
				dropdown.addOption('Urgent', 'Urgent');
				dropdown.setValue(this.priority);
				dropdown.onChange(val => this.priority = val as WorkItemPriority);
			});

		// Parent Item ID
		new Setting(contentEl)
			.setName('Parent Item ID')
			.setDesc('Parent Epic or Story ID (e.g. PROJ-101)')
			.addText(text => text
				.setPlaceholder('PROJ-100')
				.setValue(this.parentId)
				.onChange(val => this.parentId = val));

		// Assignee
		new Setting(contentEl)
			.setName('Assignee')
			.addText(text => text
				.setPlaceholder('@john')
				.setValue(this.assignee)
				.onChange(val => this.assignee = val));

		// Estimate
		new Setting(contentEl)
			.setName('Estimate (Points / Hours)')
			.addText(text => text
				.setPlaceholder('3')
				.setValue(this.estimate !== undefined ? String(this.estimate) : '')
				.onChange(val => {
					const num = Number(val);
					this.estimate = isNaN(num) ? undefined : num;
				}));

		// Description
		const descGroup = contentEl.createDiv('devops-modal-field');
		descGroup.createEl('label', { text: 'Description / Details' });
		const textarea = descGroup.createEl('textarea', {
			placeholder: 'Add acceptance criteria, user story details, or notes...'
		});
		textarea.rows = 4;
		textarea.value = this.description;
		textarea.addEventListener('input', (e) => {
			this.description = (e.target as HTMLTextAreaElement).value;
		});

		// Submit & Cancel Buttons
		const buttonGroup = contentEl.createDiv('devops-modal-actions');
		
		const cancelBtn = buttonGroup.createEl('button', { text: 'Cancel' });
		cancelBtn.addEventListener('click', () => this.close());

		const createBtn = buttonGroup.createEl('button', { 
			text: 'Create Work Item', 
			cls: 'mod-cta' 
		});
		createBtn.addEventListener('click', async () => {
			if (!this.title.trim()) {
				new Notice('Please enter a title for the work item.');
				return;
			}

			await this.workItemManager.createWorkItem({
				title: this.title.trim(),
				type: this.type,
				projectKey: this.projectKey,
				status: this.status,
				priority: this.priority,
				parentId: this.parentId.trim() || undefined,
				assignee: this.assignee.trim() || undefined,
				estimate: this.estimate,
				description: this.description.trim() || undefined
			});

			this.close();
		});
	}

	onClose(): void {
		const { contentEl } = this;
		contentEl.empty();
	}
}
