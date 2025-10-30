import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path' 


export default defineConfig({
  plugins: [react(), tailwindcss()],
  envDir: '../../',
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true
    }
  },
  resolve: {
    alias: {
      "ui-kit": path.resolve(__dirname, "../../packages/ui-kit/src") 
    }
  }
})