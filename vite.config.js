import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // A production build without VITE_API_URL would call /api on the frontend's
  // own host, which only exists on the local dev server - fail loudly instead.
  if (command === 'build' && !env.VITE_API_URL) {
    throw new Error(
      'VITE_API_URL is not set. Set it to your deployed backend origin ' +
      '(e.g. VITE_API_URL=https://api.kigalicoffeelab.com) in .env.production ' +
      "or the host's build environment before running `npm run build`."
    )
  }

  return {
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        // Points at your LOCAL backend (its default PORT is 5050 - see
        // KCL_backend/.env_example). If your backend runs on a different port,
        // change this. This is for local development only - when deploying,
        // set VITE_API_URL to your real backend URL instead (see .env and
        // src/api/axios.js), which bypasses this proxy entirely.
        target: 'http://localhost:5050',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/uploads': {
        target: 'http://localhost:5050',
        changeOrigin: true,
      },
    },
  },
  }
})
