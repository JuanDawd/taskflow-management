'use client'

import { createContext, useContext, ReactNode, useEffect } from 'react'
import { useNotificationStore } from '@/hooks/useNotificationStore'
import { useWebSocketContext } from '@/contexts/WebSocketContext'
import { Notifications } from '@/types'

interface NotificationContextType {
	notifications: Notifications[]
	unreadCount: number
	addNotification: (
		notification: Omit<Notifications, 'id' | 'timestamp' | 'read'>,
	) => Notifications
	markAsRead: (id: string) => void
	markAllAsRead: () => void
	deleteNotification: (id: string) => void
	clearAll: () => void
	getUnreadNotifications: () => Notifications[]
}

const NotificationContext = createContext<NotificationContextType | undefined>(
	undefined,
)

export function NotificationProvider({ children }: { children: ReactNode }) {
	const store = useNotificationStore()
	const { isConnected } = useWebSocketContext()

	// Request notification permission on mount
	useEffect(() => {
		if ('Notification' in window && Notification.permission === 'default') {
			Notification.requestPermission()
		}
	}, [])

	// Listen to WebSocket notifications
	useEffect(() => {
		if (!isConnected) return

		const handleWebSocketMessage = (event: MessageEvent) => {
			try {
				const message = JSON.parse(event.data)

				// Convert WebSocket messages to notifications
				if (message.type === 'task_created') {
					store.addNotification({
						type: 'task_created',
						title: 'Nueva tarea creada',
						message: `Se ha creado la tarea: ${message.data.title}`,
						userId: message.userId || '',
						taskId: message.data.id,
						projectId: message.data.projectId,
						task: {
							id: message.data.id,
							title: message.data.title,
							status: message.data.status,
						},
						actionUrl: `/tasks/${message.data.id}`,
						actionText: 'Ver tarea',
						priority: 'medium',
					})
				} else if (message.type === 'task_assigned') {
					store.addNotification({
						type: 'task_assigned',
						title: 'Tarea asignada',
						message: `Se te ha asignado la tarea: ${message.data.title}`,
						userId: message.data.assigneeId,
						taskId: message.data.id,
						projectId: message.data.projectId,
						task: {
							id: message.data.id,
							title: message.data.title,
							status: message.data.status,
						},
						actionUrl: `/tasks/${message.data.id}`,
						actionText: 'Ver tarea',
						priority: 'high',
					})
				} else if (message.type === 'comment_added') {
					store.addNotification({
						type: 'comment_added',
						title: 'Nuevo comentario',
						message: `${message.data.author.name} comentó en "${message.data.task.title}"`,
						userId: message.userId || '',
						taskId: message.data.taskId,
						commentId: message.data.id,
						user: message.data.author,
						task: message.data.task,
						actionUrl: `/tasks/${message.data.taskId}`,
						actionText: 'Ver comentario',
						priority: 'medium',
					})
				} else if (message.type === 'mention') {
					store.addNotification({
						type: 'mention',
						title: 'Te han mencionado',
						message: `${message.data.author.name} te mencionó en un comentario`,
						userId: message.data.mentionedUserId,
						taskId: message.data.taskId,
						commentId: message.data.commentId,
						mentionedById: message.data.author.id,
						user: message.data.author,
						actionUrl: `/tasks/${message.data.taskId}`,
						actionText: 'Ver mención',
						priority: 'high',
					})
				}
			} catch (error) {
				console.error('Error processing WebSocket notification:', error)
			}
		}

		// This would be handled by the WebSocket context
		// Just showing the pattern here
		window.addEventListener('websocket-message', handleWebSocketMessage)

		return () => {
			window.removeEventListener('websocket-message', handleWebSocketMessage)
		}
	}, [isConnected, store])

	const contextValue: NotificationContextType = {
		notifications: store.notifications,
		unreadCount: store.unreadCount,
		addNotification: store.addNotification,
		markAsRead: store.markAsRead,
		markAllAsRead: store.markAllAsRead,
		deleteNotification: store.deleteNotification,
		clearAll: store.clearAll,
		getUnreadNotifications: store.getUnreadNotifications,
	}

	return (
		<NotificationContext.Provider value={contextValue}>
			{children}
		</NotificationContext.Provider>
	)
}

export function useNotificationContext() {
	const context = useContext(NotificationContext)
	if (!context) {
		throw new Error(
			'useNotificationContext must be used within NotificationProvider',
		)
	}
	return context
}
