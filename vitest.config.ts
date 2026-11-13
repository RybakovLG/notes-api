import { defineConfig } from 'vitest/config'

export default defineConfig({
	test: {
		// Выполняется в каждом тестовом файле до его импортов: env будет готов раньше, чем config.ts
		setupFiles: ['./tests/setup.ts'],
	},
})
