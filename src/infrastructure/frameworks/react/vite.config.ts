import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify('http://localhost:3001/api')
  },
  resolve: {
    alias: {
      '@domain': '/usr/src/domain',
      '@application': '/usr/src/application',
      '@infrastructure': '/usr/src/infrastructure',
      '@interfaces': '/usr/src/interfaces',
      '@app': '/usr/src/app',
      '@stores': path.resolve(__dirname, 'src/stores'),
      'uuid': path.resolve(__dirname, 'node_modules/uuid')
    }
  },
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  }
});