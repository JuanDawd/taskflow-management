export interface User {
	id: string
	email: string
	name: string | null
	avatar: string | null
	createdAt: string
	updatedAt: string
	bio?: string
	timezone?: string
	role?: 'ADMIN' | 'MEMBER' | 'VIEWER'
	notifications?: {
		email: boolean
		push: boolean
		taskAssigned: boolean
		taskCompleted: boolean
		comments: boolean
	}
}

export interface Company {
	id: string
	name: string
	description?: string
	website?: string
	logo?: string
	industry?: string
	size?: string
	timezone: string
	createdAt: string
	updatedAt: string
}

export interface Project {
	id: string
	name: string
	description: string | null
	status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED'
	priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
	startDate: string | null
	endDate: string | null
	createdAt: string
	updatedAt: string
	ownerId: string
	companyId: string
	members?: User[]
	tasks?: Task[]
	_count?: {
		tasks: number
		members: number
	}
}
export interface Task {
	id: string
	title: string
	description: string | null
	status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE'
	priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
	dueDate: string | null
	estimatedHours: number | null
	actualHours: number | null
	tags: string[]
	position: number
	createdAt: string
	updatedAt: string
	projectId: string
	assigneeId: string | null
	createdById: string
	assignee?: User
	project?: Project
	comments?: Comment[]
	attachments?: Attachment[]
	_count?: {
		comments: number
		attachments: number
	}
}

export interface Comment {
	id: string
	content: string
	taskId: string
	userId: string
	parentId: string | null
	createdAt: string
	updatedAt: string
	user?: User
	replies?: Comment[]
	likes?: number
	isLiked?: boolean
}

export interface Attachment {
	id: string
	name: string
	url: string
	size: number
	type: string
	taskId: string
	uploadedById: string
	createdAt: string
	updatedAt: string
	uploadedBy?: User
}

export interface TeamMember {
	id: string
	userId: string
	companyId: string
	role: 'ADMIN' | 'MEMBER' | 'VIEWER'
	joinedAt: string
	user: User
	projects?: Project[]
}

export interface Invitation {
	id: string
	email: string
	role: 'ADMIN' | 'MEMBER' | 'VIEWER'
	token: string
	expiresAt: string
	accepted: boolean
	companyId: string
	invitedById: string
	createdAt: string
	updatedAt: string
	invitedBy?: User
}
