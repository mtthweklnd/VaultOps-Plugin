import { App, TFile, TFolder, Plugin } from 'obsidian';
import { WorkItem, WorkItemType, WorkItemStatus, WorkItemPriority, ProjectConfig, DevOpsSettings } from '../types';

export type WorkItemUpdateCallback = () => void;

export class WorkItemManager {
	private app: App;
	private plugin: Plugin;
	private getSettings: () => DevOpsSettings;
	private saveSettings: () => Promise<void>;
	
	private itemsMap: Map<string, WorkItem> = new Map(); // key: filePath
	private updateListeners: Set<WorkItemUpdateCallback> = new Set();

	constructor(
		app: App, 
		plugin: Plugin, 
		getSettings: () => DevOpsSettings, 
		saveSettings: () => Promise<void>
	) {
		this.app = app;
		this.plugin = plugin;
		this.getSettings = getSettings;
		this.saveSettings = saveSettings;
	}

	public initialize(): void {
		// Register memory-safe event listeners using plugin.registerEvent
		this.plugin.registerEvent(
			this.app.metadataCache.on('changed', (file) => {
				if (file instanceof TFile) {
					this.updateFileIndex(file);
				}
			})
		);

		this.plugin.registerEvent(
			this.app.vault.on('rename', (file, oldPath) => {
				if (file instanceof TFile) {
					this.itemsMap.delete(oldPath);
					this.updateFileIndex(file);
				}
			})
		);

		this.plugin.registerEvent(
			this.app.vault.on('delete', (file) => {
				if (file instanceof TFile) {
					if (this.itemsMap.has(file.path)) {
						this.itemsMap.delete(file.path);
						this.notifyListeners();
					}
				}
			})
		);

		// Initial index
		this.indexVault();
	}

	public subscribe(callback: WorkItemUpdateCallback): () => void {
		this.updateListeners.add(callback);
		return () => {
			this.updateListeners.delete(callback);
		};
	}

	private notifyListeners(): void {
		for (const callback of this.updateListeners) {
			callback();
		}
	}

	public indexVault(): void {
		this.itemsMap.clear();
		const files = this.app.vault.getMarkdownFiles();
		for (const file of files) {
			this.indexFile(file);
		}
		this.notifyListeners();
	}

	private indexFile(file: TFile): void {
		const item = this.parseWorkItemFromFile(file);
		if (item) {
			this.itemsMap.set(file.path, item);
		} else {
			this.itemsMap.delete(file.path);
		}
	}

	private updateFileIndex(file: TFile): void {
		const oldItem = this.itemsMap.get(file.path);
		const newItem = this.parseWorkItemFromFile(file);

		if (newItem) {
			this.itemsMap.set(file.path, newItem);
			this.notifyListeners();
		} else if (oldItem) {
			this.itemsMap.delete(file.path);
			this.notifyListeners();
		}
	}

	public parseWorkItemFromFile(file: TFile): WorkItem | null {
		const cache = this.app.metadataCache.getFileCache(file);
		if (!cache || !cache.frontmatter) return null;

		const fm = cache.frontmatter;

		// Support both prefixed (devops-type) and unprefixed (type) properties
		const typeVal = fm['devops-type'] || fm['type'];
		if (!typeVal) return null;

		const validTypes: WorkItemType[] = ['epic', 'feature', 'story', 'task', 'bug'];
		const normalizedType = String(typeVal).toLowerCase() as WorkItemType;
		if (!validTypes.includes(normalizedType)) return null;

		const settings = this.getSettings();

		const id = fm['devops-id'] || fm['id'] || file.basename;
		const title = fm['title'] || file.basename;
		const statusVal = fm['devops-status'] || fm['status'] || 'To Do';
		const validStatuses: WorkItemStatus[] = settings.statuses;
		const status: WorkItemStatus = validStatuses.includes(statusVal as WorkItemStatus) 
			? (statusVal as WorkItemStatus) 
			: 'To Do';

		const priorityVal = fm['devops-priority'] || fm['priority'] || 'Medium';
		const validPriorities: WorkItemPriority[] = ['Low', 'Medium', 'High', 'Urgent'];
		const priority: WorkItemPriority = validPriorities.includes(priorityVal as WorkItemPriority)
			? (priorityVal as WorkItemPriority)
			: 'Medium';

		const project = fm['devops-project'] || fm['project'] || settings.defaultProjectKey;
		
		// Parse parent link if present
		let parentId = fm['devops-parent'] || fm['parent'];
		if (typeof parentId === 'string') {
			// Extract from Wikilink [[PROJ-100]] if formatted as link
			const wikilinkMatch = parentId.match(/\[\[([^\]|]+)(?:\|[^\]]+)?\]\]/);
			if (wikilinkMatch) {
				parentId = wikilinkMatch[1];
			}
		}

		const assignee = fm['devops-assignee'] || fm['assignee'];
		const estimate = fm['devops-estimate'] !== undefined ? Number(fm['devops-estimate']) : (fm['estimate'] !== undefined ? Number(fm['estimate']) : undefined);
		const tags = Array.isArray(fm['tags']) ? fm['tags'] : [];

		return {
			id: String(id),
			title: String(title),
			type: normalizedType,
			status,
			priority,
			project: String(project),
			parentId: parentId ? String(parentId) : undefined,
			assignee: assignee ? String(assignee) : undefined,
			estimate: isNaN(estimate as number) ? undefined : estimate,
			tags,
			filePath: file.path,
			createdDate: file.stat.ctime ? new Date(file.stat.ctime).toISOString() : undefined,
			updatedDate: file.stat.mtime ? new Date(file.stat.mtime).toISOString() : undefined
		};
	}

	public getAllItems(): WorkItem[] {
		return Array.from(this.itemsMap.values());
	}

	public getItemsByProject(projectKey: string): WorkItem[] {
		if (!projectKey || projectKey === 'ALL') {
			return this.getAllItems();
		}
		return this.getAllItems().filter(item => item.project === projectKey);
	}

	public async createWorkItem(params: {
		title: string;
		type: WorkItemType;
		projectKey: string;
		status?: WorkItemStatus;
		priority?: WorkItemPriority;
		parentId?: string;
		assignee?: string;
		estimate?: number;
		description?: string;
	}): Promise<WorkItem> {
		const settings = this.getSettings();
		let project = settings.projects.find(p => p.key === params.projectKey);
		if (!project) {
			project = settings.projects[0] || {
				key: 'PROJ',
				name: 'Default',
				folder: settings.defaultFolder,
				nextId: 101
			};
		}

		const nextIdNum = project.nextId || 101;
		const id = `${project.key}-${nextIdNum}`;

		// Increment nextId in project config
		project.nextId = nextIdNum + 1;
		await this.saveSettings();

		// Sanitize title for filename
		const sanitizedTitle = params.title.replace(/[\\/:*?"<>|]/g, '-').trim();
		const folderPath = project.folder || settings.defaultFolder || 'DevOps';

		// Ensure directory exists
		await this.ensureFolderExists(folderPath);

		const filePath = `${folderPath}/${id} - ${sanitizedTitle}.md`;

		const usePrefix = settings.usePrefixKeys;
		const frontmatterLines = [
			'---',
			`${usePrefix ? 'devops-id' : 'id'}: "${id}"`,
			`title: "${params.title}"`,
			`${usePrefix ? 'devops-type' : 'type'}: ${params.type}`,
			`${usePrefix ? 'devops-status' : 'status'}: "${params.status || 'To Do'}"`,
			`${usePrefix ? 'devops-priority' : 'priority'}: "${params.priority || 'Medium'}"`,
			`${usePrefix ? 'devops-project' : 'project'}: "${project.key}"`
		];

		if (params.parentId) {
			frontmatterLines.push(`${usePrefix ? 'devops-parent' : 'parent'}: "[[${params.parentId}]]"`);
		}
		if (params.assignee) {
			frontmatterLines.push(`${usePrefix ? 'devops-assignee' : 'assignee'}: "${params.assignee}"`);
		}
		if (params.estimate !== undefined) {
			frontmatterLines.push(`${usePrefix ? 'devops-estimate' : 'estimate'}: ${params.estimate}`);
		}
		frontmatterLines.push('tags:');
		frontmatterLines.push(`  - devops/${params.type}`);
		frontmatterLines.push('---');
		frontmatterLines.push('');
		frontmatterLines.push(`# ${id}: ${params.title}`);
		frontmatterLines.push('');
		if (params.description) {
			frontmatterLines.push(params.description);
		} else {
			frontmatterLines.push('## Description');
			frontmatterLines.push('Add work item details, acceptance criteria, and notes here.');
		}
		frontmatterLines.push('');
		frontmatterLines.push('## Tasks');
		frontmatterLines.push('- [ ] Initial task');

		const content = frontmatterLines.join('\n');
		const file = await this.app.vault.create(filePath, content);

		// Manually populate item until metadataCache fires
		const newItem: WorkItem = {
			id,
			title: params.title,
			type: params.type,
			status: params.status || 'To Do',
			priority: params.priority || 'Medium',
			project: project.key,
			parentId: params.parentId,
			assignee: params.assignee,
			estimate: params.estimate,
			tags: [`devops/${params.type}`],
			filePath: file.path
		};

		this.itemsMap.set(file.path, newItem);
		this.notifyListeners();

		return newItem;
	}

	public async updateWorkItemStatus(filePath: string, newStatus: WorkItemStatus): Promise<void> {
		const file = this.app.vault.getAbstractFileByPath(filePath);
		if (!(file instanceof TFile)) return;

		const settings = this.getSettings();
		const usePrefix = settings.usePrefixKeys;

		await this.app.fileManager.processFrontMatter(file, (frontmatter) => {
			if (usePrefix || frontmatter['devops-status'] !== undefined) {
				frontmatter['devops-status'] = newStatus;
			} else {
				frontmatter['status'] = newStatus;
			}
		});

		// Update in-memory item immediately
		const item = this.itemsMap.get(filePath);
		if (item) {
			item.status = newStatus;
			this.notifyListeners();
		}
	}

	public async updateWorkItemPriority(filePath: string, newPriority: WorkItemPriority): Promise<void> {
		const file = this.app.vault.getAbstractFileByPath(filePath);
		if (!(file instanceof TFile)) return;

		const settings = this.getSettings();
		const usePrefix = settings.usePrefixKeys;

		await this.app.fileManager.processFrontMatter(file, (frontmatter) => {
			if (usePrefix || frontmatter['devops-priority'] !== undefined) {
				frontmatter['devops-priority'] = newPriority;
			} else {
				frontmatter['priority'] = newPriority;
			}
		});

		const item = this.itemsMap.get(filePath);
		if (item) {
			item.priority = newPriority;
			this.notifyListeners();
		}
	}

	public async openWorkItemFile(filePath: string): Promise<void> {
		const file = this.app.vault.getAbstractFileByPath(filePath);
		if (file instanceof TFile) {
			const workspace = this.app.workspace as any;
			const leaf = typeof workspace.getUnsplitLeaf === 'function' ? workspace.getUnsplitLeaf() : this.app.workspace.getLeaf(false);
			await leaf.openFile(file);
		}
	}

	private async ensureFolderExists(folderPath: string): Promise<void> {
		const folder = this.app.vault.getAbstractFileByPath(folderPath);
		if (!folder) {
			await this.app.vault.createFolder(folderPath);
		}
	}
}
