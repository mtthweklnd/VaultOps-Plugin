export type WorkItemType = 'epic' | 'feature' | 'story' | 'task' | 'bug';

export type WorkItemStatus = 'To Do' | 'In Progress' | 'In Review' | 'Done';

export type WorkItemPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface WorkItem {
	id: string; // e.g. "PROJ-101"
	title: string;
	type: WorkItemType;
	status: WorkItemStatus;
	priority: WorkItemPriority;
	project: string; // project key e.g. "PROJ"
	parentId?: string; // parent ID e.g. "PROJ-100" or file path
	parentTitle?: string;
	assignee?: string;
	estimate?: number; // story points or hours
	tags: string[];
	filePath: string;
	createdDate?: string;
	updatedDate?: string;
}

export interface ProjectConfig {
	key: string; // e.g. "PROJ"
	name: string; // e.g. "Core Platform"
	folder: string; // e.g. "DevOps/PROJ"
	nextId: number; // e.g. 101
}

export type PrimaryPaneLocation = 'right' | 'left' | 'main';

export interface DevOpsSettings {
	projects: ProjectConfig[];
	defaultProjectKey: string;
	statuses: WorkItemStatus[];
	defaultFolder: string;
	usePrefixKeys: boolean; // if true, uses devops-id, devops-type, etc.
	enableBasesView: boolean;
	primaryPaneLocation: PrimaryPaneLocation;
}

export const DEFAULT_SETTINGS: DevOpsSettings = {
	projects: [
		{
			key: "PROJ",
			name: "Default Project",
			folder: "DevOps/PROJ",
			nextId: 101
		}
	],
	defaultProjectKey: "PROJ",
	statuses: ["To Do", "In Progress", "In Review", "Done"],
	defaultFolder: "DevOps",
	usePrefixKeys: false,
	enableBasesView: false,
	primaryPaneLocation: "right"
};
