import { defineConfig } from 'vitest/config'

export default defineConfig({
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'react',
  },
  test: {
    include: ['shared/**/*.test.ts', 'vanilla/**/*.test.ts', 'remix/**/*.test.ts'],
    testTimeout: 10000,
    globals: true,
    coverage: {
      provider: 'v8',
      include: ['shared/**/*.ts', 'vanilla/**/*.ts', 'remix/**/*.ts'],
      exclude: [
        'shared/**/*.test.ts',
        'vanilla/**/*.test.ts',
        'remix/**/*.test.ts',
        'vanilla/build/**',
        'vanilla/public/**',
      ],
      reporter: ['text', 'lcov', 'html'],
    },
  },
})
