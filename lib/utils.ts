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
