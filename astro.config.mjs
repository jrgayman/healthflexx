import { defineConfig } from 'astro';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';

export default defineConfig({
  integrations: [tailwind(), react()],
  output: 'static',
  build: {
    assets: 'assets'
  },
  vite: {
    ssr: {
      noExternal: ['react-hot-toast']
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor': ['react', 'react-dom', 'react-router-dom'],
            'charts': ['chart.js', 'react-chartjs-2'],
            'utils': ['date-fns', 'slugify']
          }
        }
      }
    }
  }
});