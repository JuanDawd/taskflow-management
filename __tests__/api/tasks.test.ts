import { POST, GET } from '@/app/api/tasks/route'
import { db } from '@/lib/db'
import { NextRequest } from 'next/server'

// Mock Prisma
jest.mock('@/lib/db', () => ({
	db: {
		task: {
			create: jest.fn(),
			findMany: jest.fn(),
			findUnique: jest.fn(),
			update: jest.fn(),
			delete: jest.fn(),
		},
		user: {
			findUnique: jest.fn(),
		},
	},
}))

// Mock auth
jest.mock('next-auth', () => ({
	getServerSession: jest.fn(),
}))

describe('/api/tasks', () => {
	beforeEach(() => {
		jest.clearAllMocks()
	})

	describe('POST /api/tasks', () => {
		it('creates a new task', async () => {
			const mockTask = {
				id: 'task-1',
				title: 'Test Task',
				description: 'Test Description',
				status: 'TODO',
				priority: 'MEDIUM',
				projectId: 'project-1',
			}

			;(db.task.create as jest.Mock).mockResolvedValue(mockTask)

			const request = new NextRequest('http://localhost/api/tasks', {
				method: 'POST',
				body: JSON.stringify({
					title: 'Test Task',
					description: 'Test Description',
					projectId: 'project-1',
				}),
			})

			const response = await POST(request)
			const data = await response.json()

			expect(response.status).toBe(201)
			expect(data).toEqual(mockTask)
			expect(db.task.create).toHaveBeenCalledWith({
				data: expect.objectContaining({
					title: 'Test Task',
					description: 'Test Description',
					projectId: 'project-1',
				}),
				include: expect.any(Object),
			})
		})

		it('validates required fields', async () => {
			const request = new NextRequest('http://localhost/api/tasks', {
				method: 'POST',
				body: JSON.stringify({
					description: 'Test Description',
					// Missing title and projectId
				}),
			})

			const response = await POST(request)
			expect(response.status).toBe(400)
		})
	})

	describe('GET /api/tasks', () => {
		it('returns tasks for authenticated user', async () => {
			const mockTasks = [
				{ id: 'task-1', title: 'Task 1', status: 'TODO' },
				{ id: 'task-2', title: 'Task 2', status: 'DONE' },
			]

			;(db.task.findMany as jest.Mock).mockResolvedValue(mockTasks)

			const request = new NextRequest('http://localhost/api/tasks')
			const response = await GET(request)
			const data = await response.json()

			expect(response.status).toBe(200)
			expect(data).toEqual(mockTasks)
		})
	})
})
