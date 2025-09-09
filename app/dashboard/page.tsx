'use client'

import { useState, useEffect } from 'react'
import { Dashboard } from '@/components/dashboard/Dashboard'
import { DashboardMetrics } from '@/types'

export default function DashboardPage() {
	const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [timeRange, setTimeRange] = useState('7d')

	useEffect(() => {
		const fetchDashboardData = async () => {
			try {
				setIsLoading(true)
				const response = await fetch(`/api/dashboard?range=${timeRange}`)
				if (response.ok) {
					const data = await response.json()
					setMetrics(data)
				}
			} catch (error) {
				console.error('Error fetching dashboard data:', error)
			} finally {
				setIsLoading(false)
			}
		}
		fetchDashboardData()
	}, [timeRange])

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
			</div>
		)
	}

	if (!metrics) {
		return (
			<div className="text-center py-6 text-gray-500">
				No se pudieron cargar las métricas
			</div>
		)
	}
	return (
		<Dashboard
			metrics={metrics}
			timeRange={timeRange}
			setTimeRange={setTimeRange}
		/>
	)
}
