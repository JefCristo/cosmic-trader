import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  devtools: {
    apply: 'serve',
  },
  plugins: [react(), tailwindcss()],
})