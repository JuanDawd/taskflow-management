'use client'

import { useState } from 'react'
import { TaskForm } from '@/components/forms/TaskForm'
import { useTaskStore } from '@/hooks/useTaskStore'
import { Task } from '@prisma/client'
import { CreateTaskForm, UpdateTaskCommentForm } from '@/types'

interface TaskDialogProps {
	task?: Task
	projectId?: string
	trigger?: React.ReactNode
	open?: boolean
	onOpenChange?: (open: boolean) => void
}

export function TaskDialog({
	task,
	projectId,
	trigger,
	open: controlledOpen,
	onOpenChange: controlledOnOpenChange,
}: TaskDialogProps) {
	const [internalOpen, setInternalOpen] = useState(false)
	const { createTask, updateTask } = useTaskStore()

	const open = controlledOpen !== undefined ? controlledOpen : internalOpen
	const onOpenChange = controlledOnOpenChange || setInternalOpen

	const handleSubmit = async (data: CreateTaskForm) => {
		if (task) {
			await updateTask(task.id, data)
		} else {
			await createTask(data)
		}
	}

	if (trigger && controlledOpen === undefined) {
		return (
			<>
				<div onClick={() => setInternalOpen(true)}>{trigger}</div>
				<TaskForm
					task={task}
					projectId={projectId}
					open={open}
					onOpenChange={onOpenChange}
					onSubmit={handleSubmit}
				/>
			</>
		)
	}

	return (
		<TaskForm
			task={task}
			projectId={projectId}
			open={open}
			onOpenChange={onOpenChange}
			onSubmit={handleSubmit}
		/>
	)
}
