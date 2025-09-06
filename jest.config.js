const customJestConfig = {
	setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
	moduleDirectories: ['node_modules', '<rootDir>/'],
	testEnvironment: 'jest-environment-jsdom',
	moduleNameMapping: {
		'^@/(.*)$': '<rootDir>/$1',
	},
	collectCoverageFrom: [
		'components/**/*.{js,jsx,ts,tsx}',
		'hooks/**/*.{js,jsx,ts,tsx}',
		'lib/**/*.{js,jsx,ts,tsx}',
		'app/**/*.{js,jsx,ts,tsx}',
		'!**/*.d.ts',
		'!**/node_modules/**',
	],
	testMatch: [
		'**/__tests__/**/*.{js,jsx,ts,tsx}',
		'**/*.(test|spec).{js,jsx,ts,tsx}',
	],
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
