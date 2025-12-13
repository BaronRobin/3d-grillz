import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/New-Antigravity-react-webapp/',
  build: {
    rollupOptions: {
      output: {
        // manualChunks removed to avoid circular dependency/undefined issues in production
      },
    },
    chunkSizeWarningLimit: 1000, // Increase limit slightly as 3D apps are naturally larger
  },
})
