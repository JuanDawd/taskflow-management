import {
	BulkDeleteSchema,
	BulkUpdateTasksSchema,
	CompanySchema,
	CompanySlugSchema,
	CompanyWithUsersSchema,
	CreateCompanySchema,
	CreateProjectMemberSchema,
	CreateProjectSchema,
	CreateTaskCommentSchema,
	CreateTaskSchema,
	CreateTeamMemberSchema,
	FileUploadSchema,
	IdSchema,
	LoginUserSchema,
	PaginationSchema,
	ProjectFilterSchema,
	ProjectMemberSchema,
	ProjectRoleSchema,
	ProjectSchema,
	ProjectSlugSchema,
	ProjectWithRelationsSchema,
	RegisterUserSchema,
	SlugSchema,
	TaskAttachmentSchema,
	TaskCommentSchema,
	TaskFilterSchema,
	TaskPrioritySchema,
	TaskSchema,
	TaskStatusSchema,
	TaskWithRelationsSchema,
	TeamMemberSchema,
	UpdateCompanySchema,
	UpdateProjectMemberSchema,
	UpdateProjectSchema,
	UpdateTaskCommentSchema,
	UpdateTaskSchema,
	UpdateTeamMemberSchema,
	UpdateUserSchema,
	UserFilterSchema,
	UserRoleSchema,
	UserSchema,
	UserWithRelationsSchema,
} from '@/lib/validation'
import { z } from 'zod'

// =============================================================================
// ENUMS
// =============================================================================

export type UserRole = z.infer<typeof UserRoleSchema>
export type ProjectRole = z.infer<typeof ProjectRoleSchema>
export type TaskStatus = z.infer<typeof TaskStatusSchema>
export type TaskPriority = z.infer<typeof TaskPrioritySchema>

// =============================================================================
// BASE SCHEMAS
// =============================================================================

export type Company = z.infer<typeof CompanySchema>
export type User = z.infer<typeof UserSchema>
export type TeamMember = z.infer<typeof TeamMemberSchema>
export type Project = z.infer<typeof ProjectSchema>
export type ProjectMember = z.infer<typeof ProjectMemberSchema>
export type Task = z.infer<typeof TaskSchema>
export type TaskComment = z.infer<typeof TaskCommentSchema>
export type TaskAttachment = z.infer<typeof TaskAttachmentSchema>

// =============================================================================
// CREATE SCHEMAS (for forms/registration)
// =============================================================================

export type CreateCompanyForm = z.infer<typeof CreateCompanySchema>
export type RegisterUserForm = z.infer<typeof RegisterUserSchema>
export type LoginUserForm = z.infer<typeof LoginUserSchema>
export type CreateProjectForm = z.infer<typeof CreateProjectSchema>
export type CreateTaskForm = z.infer<typeof CreateTaskSchema>
export type CreateTaskCommentForm = z.infer<typeof CreateTaskCommentSchema>
export type CreateTeamMemberForm = z.infer<typeof CreateTeamMemberSchema>
export type CreateProjectMemberForm = z.infer<typeof CreateProjectMemberSchema>

// =============================================================================
// UPDATE SCHEMAS
// =============================================================================

export type UpdateCompanyForm = z.infer<typeof UpdateCompanySchema>
export type UpdateUserForm = z.infer<typeof UpdateUserSchema>
export type UpdateProjectForm = z.infer<typeof UpdateProjectSchema>
export type UpdateTaskForm = z.infer<typeof UpdateTaskSchema>
export type UpdateTaskCommentForm = z.infer<typeof UpdateTaskCommentSchema>
export type UpdateTeamMemberForm = z.infer<typeof UpdateTeamMemberSchema>
export type UpdateProjectMemberForm = z.infer<typeof UpdateProjectMemberSchema>

// =============================================================================
// QUERY/FILTER SCHEMAS
// =============================================================================

export type TaskFilter = z.infer<typeof TaskFilterSchema>
export type ProjectFilter = z.infer<typeof ProjectFilterSchema>
export type UserFilter = z.infer<typeof UserFilterSchema>

// =============================================================================
// PAGINATION SCHEMAS
// =============================================================================

export type Pagination = z.infer<typeof PaginationSchema>

// =============================================================================
// EXTENDED SCHEMAS WITH RELATIONS (for API responses with populated data)
// =============================================================================

export type CompanyWithUsers = z.infer<typeof CompanyWithUsersSchema>
export type UserWithRelations = z.infer<typeof UserWithRelationsSchema>
export type ProjectWithRelations = z.infer<typeof ProjectWithRelationsSchema>
export type TaskWithRelations = z.infer<typeof TaskWithRelationsSchema>

// =============================================================================
// UTILITY SCHEMAS
// =============================================================================

export type IdParam = z.infer<typeof IdSchema>
export type SlugParam = z.infer<typeof SlugSchema>
export type CompanySlugParam = z.infer<typeof CompanySlugSchema>
export type ProjectSlugParam = z.infer<typeof ProjectSlugSchema>

// =============================================================================
// FILE UPLOAD SCHEMAS
// =============================================================================

export type FileUploadForm = z.infer<typeof FileUploadSchema>

// =============================================================================
// BULK OPERATIONS SCHEMAS
// =============================================================================

export type BulkUpdateTasksForm = z.infer<typeof BulkUpdateTasksSchema>
export type BulkDeleteForm = z.infer<typeof BulkDeleteSchema>

// =============================================================================
// Custom Types
// =============================================================================

export type UpdatePasswordForm = {
	currentPassword: string
	newPassword: string
}

export type DashboardMetrics = {
	totalTasks: number
	completedTasks: number
	overdueTasks: number
	activeProjects: number
	teamMembers: number
	avgCompletionTime: number
	productivityScore: number
	tasksByStatus: Array<{ name: string; value: number; color: string }>
	tasksByPriority: Array<{ name: string; value: number; color: string }>
	weeklyProgress: Array<{ date: string; completed: number; created: number }>
	topPerformers: Array<{
		id: string
		name: string
		avatar?: string
		completedTasks: number
		score: number
	}>
	projectProgress: Array<{
		name: string
		completed: number
		total: number
		percentage: number
	}>
}

export type ProjectStats = {
	totalTasks: number
	completedTasks: number
	pendingTasks: number
	overdueTasks: number
	progressPercentage: number
	recentActivity: number
	totalComments: number
	totalFiles: number
}
