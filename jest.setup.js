import '@testing-library/jest-dom'

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
	constructor() {}
	observe() {}
	disconnect() {}
	unobserve() {}
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
	constructor() {}
	observe() {}
	disconnect() {}
	unobserve() {}
}

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
	writable: true,
	value: jest.fn().mockImplementation((query) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: jest.fn(), // deprecated
		removeListener: jest.fn(), // deprecated
		addEventListener: jest.fn(),
		removeEventListener: jest.fn(),
		dispatchEvent: jest.fn(),
	})),
})

// Mock window.URL.createObjectURL
Object.defineProperty(window.URL, 'createObjectURL', {
	writable: true,
	value: jest.fn().mockImplementation(() => 'mock-url'),
})

Object.defineProperty(window.URL, 'revokeObjectURL', {
	writable: true,
	value: jest.fn(),
})
