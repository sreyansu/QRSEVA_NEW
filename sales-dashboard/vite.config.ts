import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@qrseva/firebase-config': '../packages/firebase-config/src/index.ts',
    },
  },
})
