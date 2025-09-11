'use client'

import { useState, useEffect } from 'react'
import { Bell, Check, CheckCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { NotificationManager } from '@/lib/notifications'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { Notifications } from '@/types'

interface NotificationCenterProps {
	notificationManager: NotificationManager
}

const notificationTypeConfig = {
	task_created: {
		color: 'bg-blue-100 text-blue-700',
		label: 'Tarea creada',
	},
	task_updated: {
		color: 'bg-blue-100 text-blue-700',
		label: 'Tarea actualizada',
	},
	task_assigned: {
		color: 'bg-blue-100 text-blue-700',
		label: 'Tarea asignada',
	},
	comment_added: {
		color: 'bg-purple-100 text-purple-700',
		label: 'Nuevo comentario',
	},
	project_updated: {
		color: 'bg-orange-100 text-orange-700',
		label: 'Proyecto actualizado',
	},
	mention: {
		color: 'bg-yellow-100 text-yellow-700',
		label: 'Mención',
	},
	deadline_reminder: {
		color: 'bg-red-100 text-red-700',
		label: 'Recordatorio de fecha límite',
	},
	info: {
		color: 'bg-gray-100 text-gray-700',
		label: 'Información',
	},
	warning: {
		color: 'bg-yellow-100 text-yellow-700',
		label: 'Advertencia',
	},
	error: {
		color: 'bg-red-100 text-red-700',
		label: 'Error',
	},
}

export function NotificationCenter({
	notificationManager,
}: NotificationCenterProps) {
	const [notifications, setNotifications] = useState<Notifications[]>([])
	const [isOpen, setIsOpen] = useState(false)

	useEffect(() => {
		const handleNotifications = (newNotifications: Notifications[]) => {
			setNotifications(newNotifications)
		}

		notificationManager.subscribe(handleNotifications)
		notificationManager.requestPermission()

		return () => {
			notificationManager.unsubscribe(handleNotifications)
		}
	}, [notificationManager])

	const unreadCount = notificationManager.getUnreadCount()
	const recentNotifications = notifications.slice(0, 10)

	const handleMarkAsRead = (notificationId: string) => {
		notificationManager.markAsRead(notificationId)
	}

	const handleMarkAllAsRead = () => {
		notificationManager.markAllAsRead()
	}

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				<Button variant="ghost" size="sm" className="relative">
					<Bell className="h-5 w-5" />
					{unreadCount > 0 && (
						<Badge
							variant="destructive"
							className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
						>
							{unreadCount > 99 ? '99+' : unreadCount}
						</Badge>
					)}
				</Button>
			</PopoverTrigger>

			<PopoverContent className="w-80 p-0" align="end">
				<div className="flex items-center justify-between p-4 border-b">
					<h3 className="font-medium">Notificaciones</h3>
					{unreadCount > 0 && (
						<Button
							variant="ghost"
							size="sm"
							onClick={handleMarkAllAsRead}
							className="text-xs"
						>
							<CheckCheck className="h-4 w-4 mr-1" />
							Marcar todas
						</Button>
					)}
				</div>

				<ScrollArea className="h-96">
					{recentNotifications.length === 0 ? (
						<div className="p-8 text-center text-muted-foreground">
							<Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
							<p>No hay notificaciones</p>
						</div>
					) : (
						<div className="divide-y">
							{recentNotifications.map((notification) => {
								const typeConfig = notificationTypeConfig[notification.type]

								return (
									<div
										key={notification.id}
										className={cn(
											'p-4 hover:bg-muted/50 transition-colors cursor-pointer',
											!notification.read && 'bg-blue-50/50',
										)}
									>
										<div className="flex items-start gap-3">
											<div
												className={cn(
													'rounded-full p-1 mt-0.5',
													typeConfig.color,
												)}
											>
												<div className="h-2 w-2 rounded-full bg-current" />
											</div>

											<div className="flex-1 min-w-0">
												<div className="flex items-start justify-between gap-2">
													<div>
														<p className="font-medium text-sm leading-tight">
															{notification.title}
														</p>
														<p className="text-sm text-muted-foreground mt-1">
															{notification.message}
														</p>
														<p className="text-xs text-muted-foreground mt-2">
															{format(notification.timestamp, 'dd MMM HH:mm', {
																locale: es,
															})}
														</p>
													</div>

													{!notification.read && (
														<Button
															variant="ghost"
															size="sm"
															onClick={(e) => {
																e.stopPropagation()
																handleMarkAsRead(notification.id)
															}}
															className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
														>
															<Check className="h-3 w-3" />
														</Button>
													)}
												</div>
											</div>
										</div>
									</div>
								)
							})}
						</div>
					)}
				</ScrollArea>

				{notifications.length > 10 && (
					<div className="p-4 border-t">
						<Button variant="ghost" size="sm" className="w-full">
							Ver todas las notificaciones
						</Button>
					</div>
				)}
			</PopoverContent>
		</Popover>
	)
}
