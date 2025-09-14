import { toast } from 'sonner'

export const showSuccessToast = (title: string, description?: string) => {
	toast.success(title, {
		description,
	})
}

export const showErrorToast = (title: string, description?: string) => {
	toast.error(title, {
		description,
	})
}

export const showWarningToast = (title: string, description?: string) => {
	toast.warning(title, {
		description,
	})
}

export const showInfoToast = (title: string, description?: string) => {
	toast.info(title, {
		description,
	})
}

// Hook personalizado para manejar errores de API
export const useApiToast = () => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const showApiError = (error: any) => {
		toast.error('Error', {
			description: error?.message || 'Ocurrió un error inesperado',
		})
	}

	const showApiSuccess = (message: string) => {
		toast.success('¡Éxito!', {
			description: message,
		})
	}

	return { showApiError, showApiSuccess }
}
