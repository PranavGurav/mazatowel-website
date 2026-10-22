import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';

// The Node server remains responsible for production hosting and the API.
// Vite only compiles the React clients into public/react-build/.
export default defineConfig({
  root: 'react',
  base: '/react-build/',
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
      '/assets': 'http://localhost:3000',
      '/uploads': 'http://localhost:3000'
    }
  },
  build: {
    outDir: '../public/react-build',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: resolve(import.meta.dirname, 'react/index.html'),
        admin: resolve(import.meta.dirname, 'react/admin.html')
      },
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    }
  }
});
