import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('three') || id.includes('react-three')) {
              return 'three-vendor';
            }
            if (id.includes('react')) {
              return 'react-vendor';
            }
            return 'vendor'; // Split other dependencies into a common vendor chunk
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Increase limit slightly as 3D apps are naturally larger
  },
})
