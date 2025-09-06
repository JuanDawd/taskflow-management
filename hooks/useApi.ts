import { useState, useCallback } from 'react'
import { handleApiError, AppError } from '@/lib/validation'

interface ApiState<T> {
	data: T | null
	loading: boolean
	error: AppError | null
}

export function useApi<T>() {
	const [state, setState] = useState<ApiState<T>>({
		data: null,
		loading: false,
		error: null,
	})

	const execute = useCallback(async (apiCall: () => Promise<T>) => {
		setState((prev) => ({ ...prev, loading: true, error: null }))

		try {
			const data = await apiCall()
			setState({ data, loading: false, error: null })
			return data
		} catch (error) {
			const appError = handleApiError(error)
			setState((prev) => ({ ...prev, loading: false, error: appError }))
			throw appError
		}
	}, [])

	const reset = useCallback(() => {
		setState({ data: null, loading: false, error: null })
	}, [])

	return {
		...state,
		execute,
		reset,
	}
}
