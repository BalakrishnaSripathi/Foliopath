import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const monacoDir = path.resolve(import.meta.dirname, './node_modules/monaco-editor')

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: [
      { find: /^monaco-editor/, replacement: monacoDir },
      { find: '@', replacement: path.resolve(import.meta.dirname, './src') },
    ],
  },
  plugins: [react(),
     tailwindcss(),
  ],
})


