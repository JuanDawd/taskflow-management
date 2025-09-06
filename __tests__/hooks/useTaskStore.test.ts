import { renderHook, act } from '@testing-library/react'
import { useTaskStore } from '@/hooks/useTaskStore'

// Mock fetch
global.fetch = jest.fn()

describe('useTaskStore', () => {
	beforeEach(() => {
		;(fetch as jest.MockedFunction<typeof fetch>).mockClear()
	})

	it('fetches tasks successfully', async () => {
		const mockTasks = [
			{ id: 'task-1', title: 'Task 1', status: 'TODO' },
			{ id: 'task-2', title: 'Task 2', status: 'DONE' },
		]

		;(fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
			ok: true,
			json: async () => mockTasks,
		} as Response)

		const { result } = renderHook(() => useTaskStore())

		await act(async () => {
			await result.current.fetchTasks()
		})

		expect(result.current.tasks).toEqual(mockTasks)
		expect(result.current.isLoading).toBe(false)
		expect(result.current.error).toBeNull()
	})

	it('handles fetch error', async () => {
		;(fetch as jest.MockedFunction<typeof fetch>).mockRejectedValueOnce(
			new Error('Network error'),
		)

		const { result } = renderHook(() => useTaskStore())

		await act(async () => {
			await result.current.fetchTasks()
		})

		expect(result.current.tasks).toEqual([])
		expect(result.current.isLoading).toBe(false)
		expect(result.current.error).toBe('Network error')
	})

	it('creates task successfully', async () => {
		const newTask = { id: 'task-3', title: 'New Task', status: 'TODO' }

		;(fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce({
			ok: true,
			json: async () => newTask,
		} as Response)

		const { result } = renderHook(() => useTaskStore())

		await act(async () => {
			await result.current.createTask({
				title: 'New Task',
				projectId: 'project-1',
			})
		})

		expect(result.current.tasks).toContain(newTask)
	})
})
