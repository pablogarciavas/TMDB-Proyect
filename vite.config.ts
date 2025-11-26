import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Optimizaciones para mejor rendimiento
    cssCodeSplit: true,
    sourcemap: false, // Desactivar en producción para mejor rendimiento
    minify: 'esbuild', // Usar esbuild para minificación más rápida
    rollupOptions: {
      output: {
        manualChunks: {
          // Separar vendor chunks para mejor caching
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
        },
      },
    },
  },
})

