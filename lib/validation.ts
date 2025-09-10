import { z } from 'zod'

// =============================================================================
// ENUMS
// =============================================================================

export const UserRoleSchema = z.enum(['ADMIN', 'USER'])

export const ProjectRoleSchema = z.enum(['ADMIN', 'MEMBER'])

export const TaskStatusSchema = z.enum([
	'BACKLOG',
	'TODO',
	'IN_PROGRESS',
	'IN_REVIEW',
	'DONE',
])

export const TaskPrioritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])

// =============================================================================
// BASE SCHEMAS
// =============================================================================

export const CompanySchema = z.object({
	id: z.cuid(),
	name: z
		.string()
		.min(1, 'Company name is required')
		.max(100, 'Company name must be less than 100 characters'),
	slug: z
		.string()
		.min(1, 'Slug is required')
		.regex(
			/^[a-z0-9-]+$/,
			'Slug must contain only lowercase letters, numbers, and hyphens',
		),
	logo: z.url('Invalid logo URL').optional().nullable(),
	createdAt: z.date(),
	updatedAt: z.date(),
})

export const UserSchema = z.object({
	id: z.cuid(),
	email: z.email('Invalid email address'),
	name: z
		.string()
		.min(1, 'Name is required')
		.max(100, 'Name must be less than 100 characters'),
	avatar: z.url('Invalid avatar URL').optional().nullable(),
	role: UserRoleSchema,
	password: z.string().min(8, 'Password must be at least 8 characters'),
	companyId: z.cuid(),
	createdAt: z.date(),
	updatedAt: z.date(),
})

export const TeamMemberSchema = z.object({
	id: z.cuid(),
	role: ProjectRoleSchema,
	userId: z.cuid(),
	companyId: z.cuid(),
	createdAt: z.date(),
	updatedAt: z.date(),
})

export const ProjectSchema = z.object({
	id: z.cuid(),
	name: z
		.string()
		.min(1, 'Project name is required')
		.max(100, 'Project name must be less than 100 characters'),
	description: z
		.string()
		.max(500, 'Description must be less than 500 characters')
		.optional()
		.nullable(),
	slug: z
		.string()
		.min(1, 'Slug is required')
		.regex(
			/^[a-z0-9-]+$/,
			'Slug must contain only lowercase letters, numbers, and hyphens',
		),
	color: z
		.string()
		.regex(
			/^#[0-9A-F]{6}$/i,
			'Invalid color format. Must be a valid hex color',
		),
	companyId: z.cuid(),
	ownerId: z.cuid(),
	createdAt: z.date(),
	updatedAt: z.date(),
})

export const ProjectMemberSchema = z.object({
	id: z.cuid(),
	role: ProjectRoleSchema,
	userId: z.cuid(),
	projectId: z.cuid(),
	joinedAt: z.date(),
})

export const TaskSchema = z.object({
	id: z.cuid(),
	title: z
		.string()
		.min(1, 'Task title is required')
		.max(200, 'Task title must be less than 200 characters'),
	description: z
		.string()
		.max(1000, 'Description must be less than 1000 characters')
		.optional()
		.nullable(),
	status: TaskStatusSchema,
	priority: TaskPrioritySchema,
	dueDate: z.date().optional().nullable(),
	createdAt: z.date(),
	updatedAt: z.date(),
	projectId: z.cuid(),
	assigneeId: z.cuid().optional().nullable(),
	createdById: z.cuid(),
})

export const TaskCommentSchema = z.object({
	id: z.cuid(),
	content: z
		.string()
		.min(1, 'Comment content is required')
		.max(500, 'Comment must be less than 500 characters'),
	taskId: z.cuid(),
	userId: z.cuid(),
	createdAt: z.date(),
	updatedAt: z.date(),
})

export const TaskAttachmentSchema = z.object({
	id: z.cuid(),
	filename: z.string().min(1, 'Filename is required'),
	fileUrl: z.url('Invalid file URL'),
	fileSize: z.number().positive('File size must be positive'),
	mimeType: z.string().min(1, 'MIME type is required'),
	taskId: z.cuid(),
	uploadedAt: z.date(),
})

// =============================================================================
// CREATE SCHEMAS (for forms/registration)
// =============================================================================

export const CreateCompanySchema = CompanySchema.pick({
	name: true,
	slug: true,
	logo: true,
})

export const RegisterUserSchema = z
	.object({
		email: z.email('Invalid email address'),
		name: z
			.string()
			.min(1, 'Name is required')
			.max(100, 'Name must be less than 100 characters'),
		password: z.string().min(8, 'Password must be at least 8 characters'),
		confirmPassword: z
			.string()
			.min(8, 'Confirm password must be at least 8 characters'),
		avatar: z.url('Invalid avatar URL').optional(),
		role: UserRoleSchema.optional().default('USER'),
		companyId: z.cuid(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Passwords do not match',
		path: ['confirmPassword'],
	})

export const LoginUserSchema = z.object({
	email: z.email('Invalid email address'),
	password: z.string().min(1, 'Password is required'),
})

export const CreateProjectSchema = ProjectSchema.pick({
	name: true,
	description: true,
	slug: true,
	color: true,
}).extend({
	companyId: z.cuid().optional(), // May be set from context
	ownerId: z.cuid().optional(), // May be set from auth context
	id: z.cuid().optional(), // For editing existing projects
})

export const CreateTaskSchema = TaskSchema.pick({
	title: true,
	description: true,
	priority: true,
	dueDate: true,
	status: true,
}).extend({
	projectId: z.cuid(),
	assigneeId: z.cuid().optional(),
	status: TaskStatusSchema,
})

export const CreateTaskCommentSchema = TaskCommentSchema.pick({
	content: true,
}).extend({
	taskId: z.cuid(),
})

export const CreateTeamMemberSchema = z.object({
	userId: z.cuid(),
	companyId: z.cuid(),
	role: ProjectRoleSchema.optional().default('MEMBER'),
})

export const CreateProjectMemberSchema = z.object({
	userId: z.cuid(),
	projectId: z.cuid(),
	role: ProjectRoleSchema.optional().default('MEMBER'),
})

// =============================================================================
// UPDATE SCHEMAS
// =============================================================================

export const UpdateCompanySchema = CreateCompanySchema.partial()

export const UpdateUserSchema = z.object({
	email: z.email('Invalid email address').optional(),
	name: z
		.string()
		.min(1, 'Name is required')
		.max(100, 'Name must be less than 100 characters')
		.optional(),
	avatar: z.url('Invalid avatar URL').optional().nullable(),
	role: UserRoleSchema.optional(),
	password: z
		.string()
		.min(8, 'Password must be at least 8 characters')
		.optional(),
})

export const UpdateProjectSchema = CreateProjectSchema.partial()

export const UpdateTaskSchema = z.object({
	title: z
		.string()
		.min(1, 'Task title is required')
		.max(200, 'Task title must be less than 200 characters')
		.optional(),
	description: z
		.string()
		.max(1000, 'Description must be less than 1000 characters')
		.optional()
		.nullable(),
	status: TaskStatusSchema.optional(),
	priority: TaskPrioritySchema.optional(),
	dueDate: z.date().optional().nullable(),
	assigneeId: z.cuid().optional().nullable(),
})

export const UpdateTaskCommentSchema = z.object({
	content: z
		.string()
		.min(1, 'Comment content is required')
		.max(500, 'Comment must be less than 500 characters'),
})

export const UpdateTeamMemberSchema = z.object({
	role: ProjectRoleSchema,
})

export const UpdateProjectMemberSchema = z.object({
	role: ProjectRoleSchema,
})

// =============================================================================
// QUERY/FILTER SCHEMAS
// =============================================================================

export const TaskFilterSchema = z.object({
	status: TaskStatusSchema.optional(),
	priority: TaskPrioritySchema.optional(),
	assigneeId: z.cuid().optional(),
	projectId: z.cuid().optional(),
	search: z.string().optional(),
	dueBefore: z.date().optional(),
	dueAfter: z.date().optional(),
})

export const ProjectFilterSchema = z.object({
	companyId: z.cuid().optional(),
	ownerId: z.cuid().optional(),
	search: z.string().optional(),
})

export const UserFilterSchema = z.object({
	role: UserRoleSchema.optional(),
	companyId: z.cuid().optional(),
	search: z.string().optional(),
})

// =============================================================================
// PAGINATION SCHEMAS
// =============================================================================

export const PaginationSchema = z.object({
	page: z.number().int().positive().default(1),
	limit: z.number().int().positive().max(100).default(10),
	sortBy: z.string().optional(),
	sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

// =============================================================================
// RESPONSE SCHEMAS (for API responses)
// =============================================================================

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(
	itemSchema: T,
) =>
	z.object({
		data: z.array(itemSchema),
		pagination: z.object({
			page: z.number(),
			limit: z.number(),
			total: z.number(),
			totalPages: z.number(),
			hasNext: z.boolean(),
			hasPrev: z.boolean(),
		}),
	})

export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
	z.object({
		success: z.boolean(),
		data: dataSchema.optional(),
		error: z.string().optional(),
		message: z.string().optional(),
	})

// =============================================================================
// EXTENDED SCHEMAS WITH RELATIONS (for API responses with populated data)
// =============================================================================

export const CompanyWithUsersSchema = CompanySchema.extend({
	users: z.array(UserSchema).optional(),
	projects: z.array(ProjectSchema).optional(),
	teamMembers: z.array(TeamMemberSchema).optional(),
})

export const UserWithRelationsSchema = UserSchema.extend({
	company: CompanySchema.optional(),
	assignedTasks: z.array(TaskSchema).optional(),
	createdTasks: z.array(TaskSchema).optional(),
	comments: z.array(TaskCommentSchema).optional(),
	projectMembers: z.array(ProjectMemberSchema).optional(),
	ownedProjects: z.array(ProjectSchema).optional(),
	teamMember: TeamMemberSchema.optional(),
})

export const ProjectWithRelationsSchema = ProjectSchema.extend({
	company: CompanySchema.optional(),
	owner: UserSchema.optional(),
	tasks: z.array(TaskSchema).optional(),
	members: z.array(ProjectMemberSchema).optional(),
})

export const TaskWithRelationsSchema = TaskSchema.extend({
	project: ProjectSchema.optional(),
	assignee: UserSchema.optional(),
	createdBy: UserSchema.optional(),
	comments: z.array(TaskCommentSchema).optional(),
	attachments: z.array(TaskAttachmentSchema).optional(),
})

// =============================================================================
// UTILITY SCHEMAS
// =============================================================================

export const IdSchema = z.object({
	id: z.cuid(),
})

export const SlugSchema = z.object({
	slug: z.string().min(1),
})

export const CompanySlugSchema = z.object({
	companySlug: z.string().min(1),
})

export const ProjectSlugSchema = z.object({
	projectSlug: z.string().min(1),
})

// =============================================================================
// FILE UPLOAD SCHEMAS
// =============================================================================

export const FileUploadSchema = z.object({
	file: z
		.instanceof(File, { message: 'File is required' })
		.refine(
			(file) => file.size <= 10 * 1024 * 1024,
			'File size must be less than 10MB',
		)
		.refine(
			(file) =>
				[
					'image/jpeg',
					'image/png',
					'image/gif',
					'application/pdf',
					'text/plain',
				].includes(file.type),
			'Invalid file type. Allowed types: JPEG, PNG, GIF, PDF, TXT',
		),
	taskId: z.cuid(),
})

// =============================================================================
// BULK OPERATIONS SCHEMAS
// =============================================================================

export const BulkUpdateTasksSchema = z.object({
	taskIds: z.array(z.cuid()).min(1, 'At least one task ID is required'),
	updates: UpdateTaskSchema.partial(),
})

export const BulkDeleteSchema = z.object({
	ids: z.array(z.cuid()).min(1, 'At least one ID is required'),
})

// Error handling utilities
export class AppError extends Error {
	constructor(
		message: string,
		public statusCode: number = 500,
		public code?: string,
	) {
		super(message)
		this.name = 'AppError'
	}
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handleApiError = (error: any): AppError => {
	if (error instanceof AppError) {
		return error
	}

	if (error.code === 'NETWORK_ERROR') {
		return new AppError(
			'Error de conexión. Verifica tu internet.',
			0,
			'NETWORK_ERROR',
		)
	}

	if (error.status === 401) {
		return new AppError(
			'No autorizado. Inicia sesión nuevamente.',
			401,
			'UNAUTHORIZED',
		)
	}

	if (error.status === 403) {
		return new AppError(
			'No tienes permisos para esta acción.',
			403,
			'FORBIDDEN',
		)
	}

	if (error.status === 404) {
		return new AppError('Recurso no encontrado.', 404, 'NOT_FOUND')
	}

	if (error.status === 422) {
		return new AppError(
			'Datos inválidos. Verifica los campos.',
			422,
			'VALIDATION_ERROR',
		)
	}

	if (error.status >= 500) {
		return new AppError('Error interno del servidor.', 500, 'INTERNAL_ERROR')
	}

	return new AppError(
		error.message || 'Error desconocido',
		500,
		'UNKNOWN_ERROR',
	)
}
