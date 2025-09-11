'use client'

import { useEffect, useRef, useState } from 'react'
import { useToast } from '@/hooks/use-toast'
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

interface UseWebSocketOptions {
	onMessage?: (message: WebSocketMessage) => void
	onConnect?: () => void
	onDisconnect?: () => void
	onError?: (error: Event) => void
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
	const [isConnected, setIsConnected] = useState(false)
	const [connectionError, setConnectionError] = useState<string | null>(null)
	const wsRef = useRef<WebSocket | null>(null)
	const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
	const reconnectAttempts = useRef(0)
	const maxReconnectAttempts = 5
	const { toast } = useToast()

	const connect = () => {
		try {
			// Use secure WebSocket in production, regular WebSocket in development
			const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
			const wsUrl = `${protocol}//${window.location.host}/api/ws`

			wsRef.current = new WebSocket(wsUrl)

			wsRef.current.onopen = () => {
				setIsConnected(true)
				setConnectionError(null)
				reconnectAttempts.current = 0
				options.onConnect?.()

				// Send authentication token if available
				const token = localStorage.getItem('auth-token')
				if (token) {
					wsRef.current?.send(
						JSON.stringify({
							type: 'authenticate',
							token,
						}),
					)
				}
			}

			wsRef.current.onmessage = (event) => {
				try {
					const message: WebSocketMessage = JSON.parse(event.data)
					options.onMessage?.(message)

					const { task } = message.data as { task: Task; author: User }

					// Show toast notifications for certain events
					if (message.type === 'task_created') {
						toast({
							title: 'Nueva tarea creada',
							description: `Se ha creado la tarea: ${task.title}`,
						})
					} else if (message.type === 'task_updated') {
						toast({
							title: 'Tarea actualizada',
							description: `Se ha actualizado la tarea: ${task.title}`,
						})
					}
				} catch (error) {
					console.error('Error parsing WebSocket message:', error)
				}
			}

			wsRef.current.onclose = () => {
				setIsConnected(false)
				options.onDisconnect?.()

				// Attempt to reconnect
				if (reconnectAttempts.current < maxReconnectAttempts) {
					const delay = Math.pow(2, reconnectAttempts.current) * 1000 // Exponential backoff
					reconnectTimeoutRef.current = setTimeout(() => {
						reconnectAttempts.current++
						connect()
					}, delay)
				} else {
					setConnectionError(
						'No se pudo conectar al servidor. Recarga la página.',
					)
				}
			}

			wsRef.current.onerror = (error) => {
				console.error('WebSocket error:', error)
				setConnectionError('Error de conexión')
				options.onError?.(error)
			}
		} catch (error) {
			console.error('Error creating WebSocket connection:', error)
			setConnectionError('No se pudo establecer la conexión')
		}
	}

	const disconnect = () => {
		if (reconnectTimeoutRef.current) {
			clearTimeout(reconnectTimeoutRef.current)
		}
		if (wsRef.current) {
			wsRef.current.close()
			wsRef.current = null
		}
		setIsConnected(false)
	}

	const sendMessage = (message: WebSocketMessage) => {
		if (wsRef.current && isConnected) {
			wsRef.current.send(JSON.stringify(message))
		}
	}

	useEffect(() => {
		connect()
		return () => disconnect()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return {
		isConnected,
		connectionError,
		sendMessage,
		reconnect: connect,
		disconnect,
	}
}
