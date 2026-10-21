import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        // Points at your LOCAL backend (its default PORT is 4000 - see
        // backend/.env_example). If your backend runs on a different port,
        // change this. This is for local development only - when deploying,
        // set VITE_API_URL to your real backend URL instead (see .env and
        // src/api/axios.js), which bypasses this proxy entirely.
        target: 'http://localhost:4000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/uploads': {
        target: 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
})
