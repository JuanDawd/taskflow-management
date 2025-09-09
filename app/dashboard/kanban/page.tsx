'use client'

import KanbanBoard from '@/components/kanban/KanbanBoard'
import { useSession } from 'next-auth/react'
import React from 'react'

export default function KanbanPage() {
	const { data: session } = useSession()

	if (!session) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
			</div>
		)
	}

	return <KanbanBoard projectId={'cmfbvfzmj000v0zdjwdw1zeqd'} />
}
