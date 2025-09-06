import { z } from 'zod'

export const projectSchema = z.object({
	name: z
		.string()
		.min(1, 'El nombre es requerido')
		.max(100, 'Máximo 100 caracteres'),
	description: z.string().optional(),
	status: z.enum(['ACTIVE', 'COMPLETED', 'ARCHIVED']).default('ACTIVE'),
	priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
	startDate: z.string().optional(),
	endDate: z.string().optional(),
})

export const taskSchema = z.object({
	title: z
		.string()
		.min(1, 'El título es requerido')
		.max(200, 'Máximo 200 caracteres'),
	description: z.string().optional(),
	status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE']).default('TODO'),
	priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
	assigneeId: z.string().optional(),
	projectId: z.string().min(1, 'El proyecto es requerido'),
	dueDate: z.string().optional(),
	tags: z.array(z.string()).default([]),
})

export const commentSchema = z.object({
	content: z
		.string()
		.min(1, 'El comentario no puede estar vacío')
		.max(1000, 'Máximo 1000 caracteres'),
	taskId: z.string().min(1, 'ID de tarea requerido'),
})

export const userProfileSchema = z.object({
	name: z
		.string()
		.min(1, 'El nombre es requerido')
		.max(100, 'Máximo 100 caracteres'),
	email: z.string().email('Email inválido'),
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
		.default({}),
})

export const companySchema = z.object({
	name: z
		.string()
		.min(1, 'El nombre de la empresa es requerido')
		.max(200, 'Máximo 200 caracteres'),
	description: z.string().max(1000, 'Máximo 1000 caracteres').optional(),
	website: z.string().url('URL inválida').optional(),
	logo: z.string().url('URL inválida').optional(),
	industry: z.string().optional(),
	size: z.enum(['1-10', '11-50', '51-200', '201-500', '500+']).optional(),
	timezone: z.string().default('UTC'),
})

export const memberInviteSchema = z.object({
	email: z.string().email('Email inválido'),
	role: z.enum(['ADMIN', 'MEMBER', 'VIEWER']).default('MEMBER'),
	projectIds: z.array(z.string()).default([]),
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
