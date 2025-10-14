import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// ⚠️ Kalau repo kamu bukan "gradgift", ganti '/gradgift/' sesuai nama repo.
// Contoh: repo "wisuda-nad" -> base: '/wisuda-nad/'
export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  base: '/tasyaaulia/',
  build: { outDir: 'docs' } // penting untuk GitHub Pages (sub-path)
})
