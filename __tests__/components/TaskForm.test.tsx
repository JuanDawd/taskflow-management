import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { TaskForm } from '@/components/forms/TaskForm'
import { useToast } from '@/hooks/use-toast'

// Mock the toast hook
jest.mock('@/hooks/use-toast')
const mockToast = useToast as jest.MockedFunction<typeof useToast>

// Mock fetch
global.fetch = jest.fn()

const mockProps = {
	open: true,
	onOpenChange: jest.fn(),
	onSubmit: jest.fn(),
	projectId: 'project-1',
}

describe('TaskForm', () => {
	beforeEach(() => {
		mockToast.mockReturnValue({
			toast: jest.fn(),
		})
		;(fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
			ok: true,
			json: async () => [
				{ id: 'user-1', name: 'John Doe', email: 'john@example.com' },
			],
		} as Response)
	})

	afterEach(() => {
		jest.clearAllMocks()
	})

	it('renders task form correctly', () => {
		render(<TaskForm {...mockProps} />)

		expect(screen.getByText('Nueva Tarea')).toBeInTheDocument()
		expect(screen.getByLabelText('Título *')).toBeInTheDocument()
		expect(screen.getByLabelText('Descripción')).toBeInTheDocument()
		expect(screen.getByLabelText('Estado')).toBeInTheDocument()
		expect(screen.getByLabelText('Prioridad')).toBeInTheDocument()
	})

	it('validates required fields', async () => {
		render(<TaskForm {...mockProps} />)

		const submitButton = screen.getByText('Crear tarea')
		fireEvent.click(submitButton)

		await waitFor(() => {
			expect(screen.getByText('El título es requerido')).toBeInTheDocument()
		})
	})

	it('submits form with valid data', async () => {
		const mockOnSubmit = jest.fn().mockResolvedValue(undefined)
		render(<TaskForm {...mockProps} onSubmit={mockOnSubmit} />)

		// Fill form
		fireEvent.change(screen.getByLabelText('Título *'), {
			target: { value: 'Test Task' },
		})

		fireEvent.change(screen.getByLabelText('Descripción'), {
			target: { value: 'Test Description' },
		})

		// Submit form
		fireEvent.click(screen.getByText('Crear tarea'))

		await waitFor(() => {
			expect(mockOnSubmit).toHaveBeenCalledWith(
				expect.objectContaining({
					title: 'Test Task',
					description: 'Test Description',
				}),
			)
		})
	})

	it('handles file upload', async () => {
		render(<TaskForm {...mockProps} />)

		const file = new File(['test content'], 'test.txt', { type: 'text/plain' })
		const fileInput = screen.getByLabelText(/Haz clic para subir archivos/)

		Object.defineProperty(fileInput, 'files', {
			value: [file],
			writable: false,
		})

		fireEvent.change(fileInput)

		await waitFor(() => {
			expect(screen.getByText('test.txt')).toBeInTheDocument()
		})
	})
})
