import { toast, useToast } from '@/hooks/use-toast'

export const showSuccessToast = (title: string, description?: string) => {
	toast({
		variant: 'success',
		title,
		description,
	})
}

export const showErrorToast = (title: string, description?: string) => {
	toast({
		variant: 'destructive',
		title,
		description,
	})
}

export const showWarningToast = (title: string, description?: string) => {
	toast({
		variant: 'warning',
		title,
		description,
	})
}

export const showInfoToast = (title: string, description?: string) => {
	toast({
		variant: 'info',
		title,
		description,
	})
}

// Hook personalizado para manejar errores de API
export const useApiToast = () => {
	const { toast } = useToast()

	const showApiError = (error: any) => {
		toast({
			variant: 'destructive',
			title: 'Error',
			description: error?.message || 'Ocurrió un error inesperado',
		})
	}

	const showApiSuccess = (message: string) => {
		toast({
			variant: 'success',
			title: '¡Éxito!',
			description: message,
		})
	}

	return { showApiError, showApiSuccess }
}
