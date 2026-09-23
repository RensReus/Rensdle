import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// `base` must match the GitHub repository name: https://<user>.github.io/Rensdle/
export default defineConfig({
  base: '/Rensdle/',
  plugins: [react()],
})
