'use client'

import { create } from 'zustand'

interface Task {
	id: string
	title: string
	description?: string
	status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE'
	priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
	assigneeId?: string
	projectId: string
	dueDate?: Date
	estimatedHours?: number
	actualHours?: number
	tags: string[]
	attachments: Array<{
		name: string
		url: string
		size: number
		type: string
	}>
	createdAt: Date
	updatedAt: Date
	assignee?: {
		id: string
		name: string
		email: string
		avatar?: string
	}
	project?: {
		id: string
		name: string
	}
}

interface TaskStore {
	tasks: Task[]
	isLoading: boolean
	error: string | null
	fetchTasks: (projectId?: string) => Promise<void>
	createTask: (data: Partial<Task>) => Promise<Task>
	updateTask: (id: string, data: Partial<Task>) => Promise<Task>
	deleteTask: (id: string) => Promise<void>
	moveTask: (
		taskId: string,
		newStatus: Task['status'],
		newPosition?: number,
	) => Promise<void>
}

export const useTaskStore = create<TaskStore>((set) => ({
	tasks: [],
	isLoading: false,
	error: null,

	fetchTasks: async (projectId: string) => {
		set({ isLoading: true, error: null })
		try {
			const url = projectId ? `/api/tasks?projectId=${projectId}` : '/api/tasks'
			const response = await fetch(url)

			if (!response.ok) {
				throw new Error('Error al cargar las tareas')
			}

			const tasks = await response.json()
			set({ tasks, isLoading: false })
		} catch (error) {
			set({
				error: error instanceof Error ? error.message : 'Error desconocido',
				isLoading: false,
			})
		}
	},

	createTask: async (data) => {
		set({ isLoading: true, error: null })
		try {
			const response = await fetch('/api/tasks', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
			})

			if (!response.ok) {
				throw new Error('Error al crear la tarea')
			}

			const newTask = await response.json()
			set((state) => ({
				tasks: [...state.tasks, newTask],
				isLoading: false,
			}))

			return newTask
		} catch (error) {
			set({
				error: error instanceof Error ? error.message : 'Error desconocido',
				isLoading: false,
			})
			throw error
		}
	},

	updateTask: async (id, data) => {
		set({ isLoading: true, error: null })
		try {
			const response = await fetch(`/api/tasks/${id}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
			})

			if (!response.ok) {
				throw new Error('Error al actualizar la tarea')
			}

			const updatedTask = await response.json()
			set((state) => ({
				tasks: state.tasks.map((task) => (task.id === id ? updatedTask : task)),
				isLoading: false,
			}))

			return updatedTask
		} catch (error) {
			set({
				error: error instanceof Error ? error.message : 'Error desconocido',
				isLoading: false,
			})
			throw error
		}
	},

	deleteTask: async (id) => {
		set({ isLoading: true, error: null })
		try {
			const response = await fetch(`/api/tasks/${id}`, {
				method: 'DELETE',
			})

			if (!response.ok) {
				throw new Error('Error al eliminar la tarea')
			}

			set((state) => ({
				tasks: state.tasks.filter((task) => task.id !== id),
				isLoading: false,
			}))
		} catch (error) {
			set({
				error: error instanceof Error ? error.message : 'Error desconocido',
				isLoading: false,
			})
			throw error
		}
	},

	moveTask: async (taskId, newStatus, newPosition) => {
		try {
			const response = await fetch(`/api/tasks/${taskId}/move`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					status: newStatus,
					position: newPosition,
				}),
			})

			if (!response.ok) {
				throw new Error('Error al mover la tarea')
			}

			const updatedTask = await response.json()
			set((state) => ({
				tasks: state.tasks.map((task) =>
					task.id === taskId ? updatedTask : task,
				),
			}))

			return updatedTask
		} catch (error) {
			throw error
		}
	},
}))
