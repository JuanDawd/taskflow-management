import { useState, useMemo } from 'react'
import { Task } from '@/types'
import { SearchFilters } from '@/components/search/AdvancedSearch'

export function useTaskSearch(tasks: Task[]) {
	const [filters, setFilters] = useState<SearchFilters>({
		query: '',
		status: [],
		priority: [],
		assigneeIds: [],
		projectIds: [],
		tags: [],
		dueDateFrom: undefined,
		dueDateTo: undefined,
		createdFrom: undefined,
		createdTo: undefined,
	})

	const filteredTasks = useMemo(() => {
		return tasks.filter((task) => {
			// Text search
			if (filters.query) {
				const searchTerm = filters.query.toLowerCase()
				const titleMatch = task.title.toLowerCase().includes(searchTerm)
				const descriptionMatch = task.description
					?.toLowerCase()
					.includes(searchTerm)
				if (!titleMatch && !descriptionMatch) return false
			}

			// Status filter
			if (filters.status.length > 0 && !filters.status.includes(task.status)) {
				return false
			}

			// Priority filter
			if (
				filters.priority.length > 0 &&
				!filters.priority.includes(task.priority)
			) {
				return false
			}

			// Assignee filter
			if (filters.assigneeIds.length > 0) {
				if (
					!task.assigneeId ||
					!filters.assigneeIds.includes(task.assigneeId)
				) {
					return false
				}
			}

			// Project filter
			if (
				filters.projectIds.length > 0 &&
				!filters.projectIds.includes(task.projectId)
			) {
				return false
			}

			// Tags filter
			if (filters.tags.length > 0) {
				const taskTags = task.tags || []
				const hasMatchingTag = filters.tags.some((tag) =>
					taskTags.includes(tag),
				)
				if (!hasMatchingTag) return false
			}

			// Due date filter
			if (filters.dueDateFrom || filters.dueDateTo) {
				if (!task.dueDate) return false
				const taskDueDate = new Date(task.dueDate)

				if (filters.dueDateFrom && taskDueDate < filters.dueDateFrom) {
					return false
				}

				if (filters.dueDateTo && taskDueDate > filters.dueDateTo) {
					return false
				}
			}

			// Created date filter
			if (filters.createdFrom || filters.createdTo) {
				const taskCreatedDate = new Date(task.createdAt)

				if (filters.createdFrom && taskCreatedDate < filters.createdFrom) {
					return false
				}

				if (filters.createdTo && taskCreatedDate > filters.createdTo) {
					return false
				}
			}

			return true
		})
	}, [tasks, filters])

	const availableTags = useMemo(() => {
		const tagSet = new Set<string>()
		tasks.forEach((task) => {
			task.tags?.forEach((tag) => tagSet.add(tag))
		})
		return Array.from(tagSet).sort()
	}, [tasks])

	return {
		filters,
		setFilters,
		filteredTasks,
		availableTags,
		resultsCount: filteredTasks.length,
		totalCount: tasks.length,
	}
}
