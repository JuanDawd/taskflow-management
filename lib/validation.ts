import { z } from 'zod'

export const projectSchema = z.object({
	name: z
		.string()
		.min(1, 'El nombre es requerido')
		.max(100, 'Nombre muy largo'),
	description: z.string().max(500, 'Descripción muy larga').optional(),
	slug: z
		.string()
		.min(1, 'El slug es requerido')
		.max(50, 'Slug muy largo')
		.regex(
			/^[a-z0-9-]+$/,
			'El slug solo puede contener letras minúsculas, números y guiones',
		),
	color: z
		.string()
		.regex(/^#[0-9A-F]{6}$/i, 'Color inválido')
		.optional()
		.default('#3B82F6'),
	memberIds: z.array(z.string().cuid()).optional(),
})

export const taskSchema = z.object({
	title: z
		.string()
		.min(1, 'El título es requerido')
		.max(200, 'Título muy largo'),
	description: z.string().max(1000, 'Descripción muy larga').optional(),
	status: z
		.enum(['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'])
		.default('BACKLOG'),
	priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
	projectId: z.string().cuid('ID de proyecto inválido'),
	assigneeId: z.string().cuid('ID de asignado inválido').optional(),
	dueDate: z.string().datetime().optional().or(z.date().optional()),
})

export const userSchema = z.object({
	name: z
		.string()
		.min(1, 'El nombre es requerido')
		.max(100, 'Nombre muy largo'),
	email: z.email('Email inválido'),
	password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
	role: z.enum(['ADMIN', 'USER']).default('USER'),
})

export const commentSchema = z.object({
	content: z
		.string()
		.min(1, 'El contenido es requerido')
		.max(1000, 'Contenido muy largo'),
	taskId: z.string().cuid('ID de tarea inválido'),
})

export const userProfileSchema = z.object({
	name: z
		.string()
		.min(1, 'El nombre es requerido')
		.max(100, 'Máximo 100 caracteres'),
	email: z.email('Email inválido'),
	avatar: z.string().url('URL inválida').optional(),
	bio: z.string().max(500, 'Máximo 500 caracteres').optional(),
	timezone: z.string().optional(),
	notifications: z
		.object({
			email: z.boolean().default(true),
			push: z.boolean().default(true),
			taskAssigned: z.boolean().default(true),
			taskCompleted: z.boolean().default(true),
			comments: z.boolean().default(true),
		})
		.default({
			email: true,
			push: true,
			taskAssigned: true,
			taskCompleted: true,
			comments: true,
		}),
})

export const companySchema = z.object({
	name: z
		.string()
		.min(1, 'El nombre es requerido')
		.max(100, 'Nombre muy largo'),
	slug: z
		.string()
		.min(1, 'El slug es requerido')
		.max(50, 'Slug muy largo')
		.regex(
			/^[a-z0-9-]+$/,
			'El slug solo puede contener letras minúsculas, números y guiones',
		),
	logo: z.string().url('URL de logo inválida').optional(),
})

export const memberInviteSchema = z.object({
	email: z.string().email('Email inválido'),
	role: z.enum(['ADMIN', 'MEMBER', 'VIEWER']).default('MEMBER'),
	projectIds: z.array(z.string()).default([]),
})

export const loginSchema = z.object({
	email: z.email('Email inválido'),
	password: z.string().min(1, 'La contraseña es requerida'),
})

export const registerSchema = z.object({
	name: z
		.string()
		.min(1, 'El nombre es requerido')
		.max(100, 'Nombre muy largo'),
	email: z.email('Email inválido'),
	password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
	companyName: z
		.string()
		.min(1, 'El nombre de empresa es requerido')
		.max(100, 'Nombre muy largo'),
	companySlug: z
		.string()
		.min(1, 'El slug de empresa es requerido')
		.max(50, 'Slug muy largo')
		.regex(
			/^[a-z0-9-]+$/,
			'El slug solo puede contener letras minúsculas, números y guiones',
		),
})

export const teamMemberSchema = z.object({
	userId: z.cuid('ID de usuario inválido'),
	role: z.enum(['ADMIN', 'MEMBER']).default('MEMBER'),
})

export const taskStatusSchema = z.object({
	status: z.enum(['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']),
})

export const paginationSchema = z.object({
	page: z.coerce.number().min(1).default(1),
	limit: z.coerce.number().min(1).max(100).default(10),
	search: z.string().optional(),
	status: z
		.enum(['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'])
		.optional(),
	priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
	assigneeId: z.string().cuid().optional(),
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
