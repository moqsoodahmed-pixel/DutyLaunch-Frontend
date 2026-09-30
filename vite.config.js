import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(process.cwd(), 'src') },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:8080', changeOrigin: true },
    },
  },
  build: {
    target: 'es2020',
    sourcemap: false,
    // Raise the warning threshold — our chunks are intentionally split this way
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        /**
         * Manual chunk strategy — keeps the initial bundle small and splits
         * heavy dependencies into stable, separately-cacheable files.
         *
         * Why this matters for the "stale chunk after deploy" error:
         * The smaller each chunk is, the shorter the window between a new
         * deploy landing and a stale-tab user hitting a broken hash. Keeping
         * vendor libraries (react, framer-motion, three.js) in their own
         * named chunks means they almost never change between deploys, so
         * their long-cached versions remain valid even after a code update.
         */
        manualChunks(id) {
          // Core React runtime — almost never changes, cache forever
          if (id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/react-router-dom/') ||
            id.includes('node_modules/scheduler/')) {
            return 'react';
          }
          // Animation — large but stable between deploys
          if (id.includes('node_modules/framer-motion/')) {
            return 'motion';
          }
          // Three.js and React-Three-Fiber — only loaded on pages that use 3D
          if (id.includes('node_modules/three/') ||
            id.includes('node_modules/@react-three/')) {
            return 'three';
          }
          // Lucide icons — large icon set, stable between deploys
          if (id.includes('node_modules/lucide-react/')) {
            return 'icons';
          }
          // Auth errors helper — tiny, keep separate
          if (id.includes('src/services/authErrors') ||
            id.includes('src/utils/authErrors')) {
            return 'authErrors';
          }
          // Everything else goes into Rollup's default per-page chunks
          return undefined;
        },
      },
    },
  },
});