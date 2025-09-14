// components/notification-provider.tsx
'use client'

import { useNotifications } from '@/hooks/use-notifications'
import { useSession } from 'next-auth/react'

export function NotificationProvider({
	children,
}: {
	children: React.ReactNode
}) {
	const { data: session } = useSession()
	const { isConnected } = useNotifications(session?.user?.id || null)

	return (
		<>
			{children}
			{/* Optional: Connection status indicator */}
			{process.env.NODE_ENV === 'development' && (
				<div className="fixed top-4 right-4 text-xs text-gray-500 bg-white p-2 rounded shadow">
					SSE: {isConnected ? '🟢' : '🔴'}
					<br />
					User: {session?.user?.id?.slice(-8) || 'None'}
				</div>
			)}
		</>
	)
}
