import { defineConfig } from 'vitest/config'

export default defineConfig({
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'react',
  },
  test: {
    include: ['shared/**/*.test.ts', 'vanilla/**/*.test.ts', 'remix/**/*.test.{ts,tsx}'],
    testTimeout: 10000,
    globals: true,
    coverage: {
      provider: 'v8',
      include: ['shared/**/*.ts', 'vanilla/**/*.ts', 'remix/**/*.ts'],
      exclude: [
        'shared/**/*.test.ts',
        'vanilla/**/*.test.ts',
        'remix/**/*.test.{ts,tsx}',
        'vanilla/build/**',
        'vanilla/public/**',
        'remix/vite-env.d.ts',
        'remix/vite.config.ts',
      ],
      reporter: ['text', 'lcov', 'html'],
    },
  },
})
