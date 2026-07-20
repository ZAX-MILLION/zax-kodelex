import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: process.env.VITE_BASE || '/',
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    // Skip heavy PWA precache on public demo builds so first visit stays snappy
    ...(process.env.VITE_DEMO_MODE === 'true'
      ? []
      : [
          VitePWA({
            registerType: 'autoUpdate' as const,
            includeAssets: ['zax-million-favicon.png', 'favicon.ico', 'robots.txt'],
            manifest: {
              name: 'Zax Million',
              short_name: 'Zax Million',
              description: 'Premium manga reading experience by Zax Million',
              theme_color: '#1e3a8a',
              background_color: '#1a1a1a',
              display: 'standalone' as const,
              icons: [
                {
                  src: 'zax-million-favicon.png',
                  sizes: '192x192',
                  type: 'image/png',
                },
                {
                  src: 'zax-million-favicon.png',
                  sizes: '512x512',
                  type: 'image/png',
                },
              ],
            },
            workbox: {
              globPatterns: ['**/*.{js,css,html,ico,png,jpg,svg}'],
              maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
              runtimeCaching: [
                {
                  urlPattern: /^https:\/\/.*\.(?:png|jpg|jpeg|svg|gif|webp)$/,
                  handler: 'CacheFirst' as const,
                  options: {
                    cacheName: 'images',
                    expiration: {
                      maxEntries: 100,
                      maxAgeSeconds: 60 * 60 * 24 * 30,
                    },
                  },
                },
                {
                  urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                  handler: 'CacheFirst' as const,
                  options: {
                    cacheName: 'google-fonts-cache',
                    expiration: {
                      maxEntries: 10,
                      maxAgeSeconds: 60 * 60 * 24 * 365,
                    },
                  },
                },
              ],
            },
          }),
        ]),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-toast', '@radix-ui/react-tabs'],
          utils: ['clsx', 'tailwind-merge', 'class-variance-authority']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
}));
