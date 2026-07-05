import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['shared/**/*.test.ts', 'vanilla/**/*.test.ts'],
    testTimeout: 10000,
    globals: true,
  },
  coverage: {
    provider: 'v8',
    include: ['shared/**/*.ts', 'vanilla/**/*.ts'],
    exclude: [
      'shared/**/*.test.ts',
      'vanilla/**/*.test.ts',
      'vanilla/build/**',
      'vanilla/public/**',
    ],
    reporter: ['text', 'lcov', 'html'],
  },
})
