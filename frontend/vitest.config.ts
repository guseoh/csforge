import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const rootDir = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  resolve: {
    alias: [
      {
        find: /.*\/visualization\/LazyLearningVisualization(?:\.tsx)?$/,
        replacement: path.resolve(rootDir, 'src/components/visualization/LearningVisualization.tsx'),
      },
    ],
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
