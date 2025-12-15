import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // We copy manifest.json manually because it is in the root, not a public folder
    viteStaticCopy({
      targets: [
        {
          src: 'manifest.json',
          dest: '.'
        }
      ]
    })
  ],
  define: {
    // This injects the GitHub Secret into the client-side code during build
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  }
})