import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Simple config without Terser
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist'
  }
})