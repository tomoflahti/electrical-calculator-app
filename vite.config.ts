import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    target: 'es2020',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunking
          if (id.includes('node_modules')) {
            // Separate major vendor libraries
            if (id.includes('@mui/') || id.includes('@emotion/')) {
              return 'mui'
            }
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor'
            }
            // All other node_modules go into vendor chunk
            return 'vendor'
          }
          
          // Application code splitting for lazy-loaded components
          if (id.includes('src/components/')) {
            if (id.includes('UniversalWireCalculator')) {
              return 'universal-calc'
            }
            if (id.includes('VoltageDropCalculator')) {
              return 'voltage-calc'
            }
            if (id.includes('ConduitFillCalculator')) {
              return 'conduit-calc'
            }
            if (id.includes('DCWireCalculator')) {
              return 'dc-calc'
            }
          }
          
          // All other application code stays in main chunk
          return undefined
        }
      }
    },
    chunkSizeWarningLimit: 600,
    sourcemap: false
  },
  define: {
    // Ensure proper environment variable handling
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production')
  }
})
