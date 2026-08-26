import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    css: true,
    exclude: ['node_modules', '.next', 'e2e', 'playwright-report'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: [
        'node_modules',
        '.next',
        'e2e',
        '**/*.config.*',
        'src/app/**/layout.tsx',
        'src/generated/**',
      ],
    },
  },
})
