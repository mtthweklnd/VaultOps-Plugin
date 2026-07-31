import { App, Modal, Notice, Setting } from 'obsidian';
import type { ProjectConfig } from '../types';

export class ProjectModal extends Modal {
	private mode: 'add' | 'edit';
	private initialConfig?: ProjectConfig;
	private existingKeys: string[];
	private onSubmit: (project: ProjectConfig) => Promise<void>;

	private key: string = '';
	private name: string = '';
	private folder: string = '';
	private nextId: number = 101;

	constructor(
		app: App,
		mode: 'add' | 'edit',
		existingKeys: string[],
		onSubmit: (project: ProjectConfig) => Promise<void>,
		initialConfig?: ProjectConfig
	) {
		super(app);
		this.mode = mode;
		this.existingKeys = existingKeys;
		this.onSubmit = onSubmit;
		this.initialConfig = initialConfig;

		if (initialConfig) {
			this.key = initialConfig.key;
			this.name = initialConfig.name;
			this.folder = initialConfig.folder;
			this.nextId = initialConfig.nextId ?? 101;
		}
	}

	onOpen(): void {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.addClass('devops-modal-container');

		contentEl.createEl('h2', { text: this.mode === 'add' ? 'Add New Project' : 'Edit Project' });

		// Key Setting
		new Setting(contentEl)
			.setName('Project Key')
			.setDesc('Short uppercase code used for work item IDs (e.g., CORE for CORE-101)')
			.addText(text => {
				text.setPlaceholder('e.g. CORE')
					.setValue(this.key)
					.onChange(val => {
						this.key = val.trim().toUpperCase();
						// Auto-suggest default folder if adding new project
						if (this.mode === 'add' && (!this.folder || this.folder.startsWith('DevOps/'))) {
							this.folder = this.key ? `DevOps/${this.key}` : 'DevOps';
							folderInputText?.setValue(this.folder);
						}
					});
			});

		// Name Setting
		new Setting(contentEl)
			.setName('Project Name')
			.setDesc('Human-readable title for the project')
			.addText(text => text
				.setPlaceholder('e.g. Core Platform')
				.setValue(this.name)
				.onChange(val => this.name = val));

		// Folder Setting
		let folderInputText: any = null;
		new Setting(contentEl)
			.setName('Folder Path')
			.setDesc('Vault folder path where project work items are stored')
			.addText(text => {
				folderInputText = text;
				text.setPlaceholder('e.g. DevOps/CORE')
					.setValue(this.folder)
					.onChange(val => this.folder = val);
			});

		// Next ID Setting
		new Setting(contentEl)
			.setName('Next Item ID Number')
			.setDesc('Numerical sequence counter for the next created work item')
			.addText(text => text
				.setPlaceholder('101')
				.setValue(String(this.nextId))
				.onChange(val => {
					const num = parseInt(val.trim(), 10);
					if (!isNaN(num) && num > 0) {
						this.nextId = num;
					}
				}));

		// Buttons
		const buttonGroup = contentEl.createDiv('devops-modal-actions');

		const cancelBtn = buttonGroup.createEl('button', { text: 'Cancel' });
		cancelBtn.addEventListener('click', () => this.close());

		const saveBtn = buttonGroup.createEl('button', {
			text: this.mode === 'add' ? 'Add Project' : 'Save Changes',
			cls: 'mod-cta'
		});

		saveBtn.addEventListener('click', async () => {
			const sanitizedKey = this.key.trim().toUpperCase();
			if (!sanitizedKey) {
				new Notice('Please enter a valid Project Key.');
				return;
			}

			// Validate alphanumeric key
			if (!/^[A-Z0-9_-]+$/.test(sanitizedKey)) {
				new Notice('Project Key can only contain letters, numbers, hyphens, and underscores.');
				return;
			}

			// Check key uniqueness if key is new or changed
			const originalKey = this.initialConfig?.key;
			if ((this.mode === 'add' || sanitizedKey !== originalKey) && this.existingKeys.includes(sanitizedKey)) {
				new Notice(`Project Key "${sanitizedKey}" already exists. Please use a unique key.`);
				return;
			}

			const finalName = this.name.trim() || sanitizedKey;
			const finalFolder = this.folder.trim() || `DevOps/${sanitizedKey}`;

			const updatedProject: ProjectConfig = {
				key: sanitizedKey,
				name: finalName,
				folder: finalFolder,
				nextId: this.nextId
			};

			await this.onSubmit(updatedProject);
			this.close();
		});
	}

	onClose(): void {
		const { contentEl } = this;
		contentEl.empty();
	}
}
