'use client'

import { createContext, useContext } from 'react'
import { useWebSocket } from '@/hooks/useWebSocket'
import { useTaskStore } from '@/hooks/useTaskStore'
import { notificationManager } from '@/lib/notifications'
import { useSession } from 'next-auth/react'
import { Task, User } from '@prisma/client'

interface WebSocketMessage {
	type:
		| 'task_created'
		| 'task_updated'
		| 'task_deleted'
		| 'comment_added'
		| 'user_joined'
		| 'user_left'
	data:
		| { task: Task; author: User } // comment_added
		| { user: User } // user_joined
		| { task: Task }
	userId?: string
	timestamp: string
}
interface WebSocketContextType {
	isConnected: boolean
	connectionError: string | null
	sendMessage: (message: WebSocketMessage) => void
	reconnect: () => void
}

const WebSocketContext = createContext<WebSocketContextType | null>(null)

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
	const { fetchTasks } = useTaskStore()

	const { isConnected, connectionError, sendMessage, reconnect } = useWebSocket(
		{
			onMessage: (message) => {
				try {
					const { type } = message
					switch (type) {
						case 'task_created':
						case 'task_updated':
						case 'task_deleted':
							// Refresh tasks when changes occur
							fetchTasks()
							break

						case 'comment_added':
							if ('author' in message.data)
								notificationManager.addNotification({
									type: 'comment_added',
									title: 'Nuevo comentario',
									message: `${
										message.data.author.name || 'Usuario'
									} comentó en "${message.data.task.title || 'una tarea'}"`,
									priority: 'medium',
									userId: message.data.author.name,
									taskId: message.data?.task?.id,
									actionUrl: `/tasks/${message.data?.task?.id}`,
									user: {
										id: message.data?.author.id,
										name: message.data?.author.name,
										avatar: message.data?.author.avatar ?? undefined,
									},
									task: message.data?.task,
								})
							break

						case 'user_joined':
							if ('user' in message.data)
								notificationManager.addNotification({
									type: 'info',
									title: 'Usuario conectado',
									message: `${
										message.data?.user.name || 'Un usuario'
									} se ha conectado`,
									priority: 'low',
									userId: message.data?.user.id || '',
									user: {
										id: message.data?.user.id,
										name: message.data?.user.name,
										avatar: message.data?.user.avatar ?? undefined,
									},
								})
							break
					}
				} catch (error) {
					console.error('Error parsing WebSocket message:', error)
				}
			},
			onConnect: () => {
				console.log('WebSocket connected')
			},
			onDisconnect: () => {
				console.log('WebSocket disconnected')
			},
			onError: (error) => {
				console.error('WebSocket error:', error)
			},
		},
	)

	return (
		<WebSocketContext.Provider
			value={{
				isConnected,
				connectionError,
				sendMessage,
				reconnect,
			}}
		>
			{children}
		</WebSocketContext.Provider>
	)
}

export function useWebSocketContext() {
	const context = useContext(WebSocketContext)
	if (!context) {
		throw new Error('useWebSocketContext must be used within WebSocketProvider')
	}
	return context
}
