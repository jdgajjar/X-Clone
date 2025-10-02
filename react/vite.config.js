import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],

  // Development server configuration
  server: {
    port: 5173, // default Vite port
    open: true, // automatically open browser
    proxy: {
      // Proxy API requests to backend
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },

  // Build configuration for production
  build: {
    outDir: 'dist', // output folder
    sourcemap: false, // disable sourcemaps
    assetsDir: 'assets', // folder for static assets
    rollupOptions: {
      output: {
        manualChunks: undefined, // optional: bundle all in one
      },
    },
    minify: 'esbuild', // fast minification
    target: 'es2015', // browser compatibility
  },

  // Base URL for relative paths (fixes nested route asset loading issues)
  base: '/',

  // Environment variables handling
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },

  // Resolve aliases
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // import paths like '@/components/Component'
    },
  },

  // Public folder handling
  publicDir: 'public', // ensures assets like _redirects are copied for SPA hosting
});
