import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Проксирование API запросов на серверную часть
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    // Используем esbuild для минификации вместо terser
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          // Разделение кода на отдельные бандлы
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['react-icons']
        }
      }
    }
  }
}); 