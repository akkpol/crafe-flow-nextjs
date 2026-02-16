import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'node',
        globals: true,
        setupFiles: ['./vitest.setup.ts'],
        include: ['**/__tests__/**/*.test.{ts,tsx}'],
        testTimeout: 10000,
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html'],
            include: ['lib/**', 'actions/**', 'app/**'],
            exclude: ['**/*.d.ts', '**/node_modules/**'],
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, '.'),
        },
    },
})
