'use client'

import { createContext, useContext, ReactNode } from 'react'
import { NotificationManager } from '@/lib/notifications'
import { useNotifications } from '@/hooks/useNotifications'

interface NotificationContextType {
	notifications: any[]
	unreadCount: number
	markAsRead: (id: string) => void
	markAllAsRead: () => void
	notificationManager: NotificationManager
}

const NotificationContext = createContext<NotificationContextType | undefined>(
	undefined,
)

export function NotificationProvider({ children }: { children: ReactNode }) {
	const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'
	const notificationData = useNotifications(wsUrl)

	return (
		<NotificationContext.Provider value={notificationData}>
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
