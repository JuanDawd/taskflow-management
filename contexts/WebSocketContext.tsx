'use client'

import { createContext, useContext } from 'react'
import { useWebSocket } from '@/hooks/useWebSocket'
import { useTaskStore } from '@/hooks/useTaskStore'
import { useNotificationStore } from '@/hooks/useNotificationStore'

interface WebSocketContextType {
	isConnected: boolean
	connectionError: string | null
	sendMessage: (message: any) => void
	reconnect: () => void
}

const WebSocketContext = createContext<WebSocketContextType | null>(null)

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
	const { fetchTasks } = useTaskStore()
	const { addNotification } = useNotificationStore()

	const { isConnected, connectionError, sendMessage, reconnect } = useWebSocket(
		{
			onMessage: (message) => {
				switch (message.type) {
					case 'task_created':
					case 'task_updated':
					case 'task_deleted':
						// Refresh tasks when changes occur
						fetchTasks()
						break

					case 'comment_added':
						addNotification({
							id: Date.now().toString(),
							type: 'comment',
							title: 'Nuevo comentario',
							message: `${message.data.author.name} comentó en "${message.data.task.title}"`,
							timestamp: new Date(),
							read: false,
							taskId: message.data.taskId,
						})
						break

					case 'user_joined':
						addNotification({
							id: Date.now().toString(),
							type: 'info',
							title: 'Usuario conectado',
							message: `${message.data.name} se ha conectado`,
							timestamp: new Date(),
							read: false,
						})
						break
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
