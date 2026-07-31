import { App, Notice, PluginSettingTab, Setting } from 'obsidian';
import type VaultDevOpsPlugin from './main';
import { ProjectConfig } from './types';
import { ProjectModal } from './modals/ProjectModal';

export class DevOpsSettingTab extends PluginSettingTab {
	plugin: VaultDevOpsPlugin;

	constructor(app: App, plugin: VaultDevOpsPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl('h2', { text: 'Vault DevOps Settings' });

		// Default Storage Directory
		new Setting(containerEl)
			.setName('Default Storage Directory')
			.setDesc('Default vault directory where new work items will be created.')
			.addText(text => text
				.setPlaceholder('DevOps')
				.setValue(this.plugin.settings.defaultFolder)
				.onChange(async (value) => {
					this.plugin.settings.defaultFolder = value.trim() || 'DevOps';
					await this.plugin.saveSettings();
				}));

		// Default Project Key
		const projects = this.plugin.settings.projects;
		new Setting(containerEl)
			.setName('Default Project')
			.setDesc('Select the project used by default when creating new work items.')
			.addDropdown(dropdown => {
				projects.forEach(p => {
					dropdown.addOption(p.key, `${p.name} (${p.key})`);
				});
				// If defaultProjectKey isn't valid, fallback to first project
				if (!projects.some(p => p.key === this.plugin.settings.defaultProjectKey)) {
					this.plugin.settings.defaultProjectKey = projects[0]?.key || 'PROJ';
				}
				dropdown.setValue(this.plugin.settings.defaultProjectKey);
				dropdown.onChange(async (value) => {
					this.plugin.settings.defaultProjectKey = value;
					await this.plugin.saveSettings();
				});
			});

		// Use Prefix Keys Toggle
		new Setting(containerEl)
			.setName('Use Prefix for Frontmatter Keys')
			.setDesc('When enabled, keys will use devops-id, devops-status, devops-type, etc. instead of id, status, type.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.usePrefixKeys)
				.onChange(async (value) => {
					this.plugin.settings.usePrefixKeys = value;
					await this.plugin.saveSettings();
				}));

		containerEl.createEl('h3', { text: 'Projects Configuration' });

		const existingKeys = projects.map(p => p.key);

		projects.forEach((project, index) => {
			new Setting(containerEl)
				.setName(`Project: ${project.name} (${project.key})`)
				.setDesc(`Folder: ${project.folder} | Next ID: ${project.key}-${project.nextId}`)
				.addButton(btn => btn
					.setButtonText('Edit')
					.onClick(() => {
						new ProjectModal(
							this.app,
							'edit',
							existingKeys,
							async (updatedProj: ProjectConfig) => {
								const oldKey = project.key;
								projects[index] = updatedProj;

								// Update defaultProjectKey if the edited project was the default
								if (this.plugin.settings.defaultProjectKey === oldKey) {
									this.plugin.settings.defaultProjectKey = updatedProj.key;
								}

								await this.plugin.saveSettings();
								new Notice(`Updated project "${updatedProj.name}" (${updatedProj.key}).`);
								this.display();
							},
							project
						).open();
					}))
				.addButton(btn => btn
					.setButtonText('Delete')
					.setWarning()
					.onClick(async () => {
						if (projects.length <= 1) {
							new Notice('Must have at least one project defined.');
							return;
						}

						const deletedKey = project.key;
						projects.splice(index, 1);

						// If deleted project was default, set default to first remaining project
						if (this.plugin.settings.defaultProjectKey === deletedKey) {
							this.plugin.settings.defaultProjectKey = projects[0].key;
						}

						await this.plugin.saveSettings();
						new Notice(`Deleted project "${project.name}" (${deletedKey}).`);
						this.display();
					}));
		});

		// Add New Project Setting
		new Setting(containerEl)
			.setName('Add New Project')
			.setDesc('Define a new project key, name, folder location, and sequence start.')
			.addButton(btn => btn
				.setButtonText('Add Project')
				.setCta()
				.onClick(() => {
					new ProjectModal(
						this.app,
						'add',
						existingKeys,
						async (newProj: ProjectConfig) => {
							this.plugin.settings.projects.push(newProj);
							// If default project is not set, set to new project
							if (!this.plugin.settings.defaultProjectKey) {
								this.plugin.settings.defaultProjectKey = newProj.key;
							}
							await this.plugin.saveSettings();
							new Notice(`Project "${newProj.name}" (${newProj.key}) added successfully.`);
							this.display();
						}
					).open();
				}));
	}
}
