import { useState, useMemo } from 'react'
import { Task, TaskFilter } from '@/types'

export function useTaskSearch(tasks: Task[]) {
	const [filters, setFilters] = useState<TaskFilter>({})

	const filteredTasks = useMemo(() => {
		return tasks.filter((task) => {
			// Status filter
			if (
				filters.status &&
				filters.status.length > 0 &&
				!filters.status.includes(task.status)
			) {
				return false
			}

			// Priority filter
			if (
				filters.priority &&
				filters.priority.length > 0 &&
				!filters.priority.includes(task.priority)
			) {
				return false
			}

			// Assignee filter
			if (filters.assigneeId && filters.assigneeId.length > 0) {
				if (!task.assigneeId || !filters.assigneeId.includes(task.assigneeId)) {
					return false
				}
			}

			// Project filter
			if (
				filters.projectId &&
				filters.projectId.length > 0 &&
				!filters.projectId.includes(task.projectId)
			) {
				return false
			}

			// Due date filter
			if (filters.dueAfter || filters.dueBefore) {
				if (!task.dueDate) return false
				const taskDueDate = new Date(task.dueDate)

				if (filters.dueAfter && taskDueDate < filters.dueAfter) {
					return false
				}

				if (filters.dueBefore && taskDueDate > filters.dueBefore) {
					return false
				}
			}

			return true
		})
	}, [tasks, filters])

	return {
		filters,
		setFilters,
		filteredTasks,
		resultsCount: filteredTasks.length,
		totalCount: tasks.length,
	}
}
