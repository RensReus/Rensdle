import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { puzzleEditor } from './editor-plugin.ts'

// `base` must match the GitHub repository name: https://<user>.github.io/Rensdle/
export default defineConfig({
  base: '/Rensdle/',
  plugins: [react(), puzzleEditor()],
  server: {
    host: '127.0.0.1',
    port: 5055,
    strictPort: true,
  },
})
