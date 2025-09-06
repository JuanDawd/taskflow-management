import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
	return new Date(date).toLocaleDateString('es-ES', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	})
}

export function getInitials(name: string): string {
	return name
		.split(' ')
		.map((word) => word[0])
		.join('')
		.toUpperCase()
		.slice(0, 2)
}

export const COLORS = {
	TODO: '#94a3b8',
	IN_PROGRESS: '#3b82f6',
	REVIEW: '#f59e0b',
	DONE: '#10b981',
	LOW: '#06b6d4',
	MEDIUM: '#eab308',
	HIGH: '#f97316',
	URGENT: '#ef4444',
}
