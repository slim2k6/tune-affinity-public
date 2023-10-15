import { defineConfig } from 'vite'
import reactRefresh from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    reactRefresh(),
  ],
  build: {
    outDir: '../cdk/website',
    minify: false,
  },
  server: {
    proxy: {
      '/oauth2/authorization/spotify': 'http://localhost:8080',
      '/api/': 'http://localhost:8080/',
    }
  },
  define: {
    global: {},
  },
  resolve: {
    alias: {
     './runtimeConfig': './runtimeConfig.browser',
    },
  }
})