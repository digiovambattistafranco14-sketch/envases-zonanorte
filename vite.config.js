import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Los encabezados de seguridad viven en vercel.json (los aplica Vercel). La
// vista previa local (npm run preview) usa los mismos, para probarlos antes de
// publicar.
const vercel = JSON.parse(readFileSync(new URL('./vercel.json', import.meta.url), 'utf8'))
const securityHeaders = Object.fromEntries(
  vercel.headers
    .find((rule) => rule.source === '/(.*)')
    .headers.filter(({ key }) => key !== 'Strict-Transport-Security') // en la compu no hay HTTPS
    .map(({ key, value }) => [key, value.replace('; upgrade-insecure-requests', '')]),
)

export default defineConfig({
  plugins: [react(), tailwindcss()],
  preview: { headers: securityHeaders },
})
