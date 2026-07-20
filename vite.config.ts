import { defineConfig, type PluginOption } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from 'vite-plugin-pwa';
import { seoArtifactsPlugin } from "./vite.seo-plugin";

// https://vitejs.dev/config/
export default defineConfig(() => {
  const plugins: PluginOption[] = [
    react(),
    seoArtifactsPlugin(),
  ];

  if (process.env.ANALYZE === 'true') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { visualizer } = require('rollup-plugin-visualizer') as typeof import('rollup-plugin-visualizer');
    plugins.push(
      visualizer({
        filename: 'docs/releases/seamless-v2/bundle-stats.html',
        gzipSize: true,
        brotliSize: true,
        open: false,
      }) as PluginOption
    );
  }

  if (process.env.VITE_DEMO_MODE !== 'true') {
    plugins.push(
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['zax-million-favicon.png', 'favicon.ico'],
        manifest: {
          name: 'Zax Million',
          short_name: 'Zax Million',
          description: 'Premium manga reading experience by Zax Million',
          theme_color: '#1e3a8a',
          background_color: '#1a1a1a',
          display: 'standalone',
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
          globIgnores: ['**/demo/chapters/**', '**/demo/chapters/**/*'],
          maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/.*\.(?:png|jpg|jpeg|svg|gif|webp)$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'images',
                expiration: {
                  maxEntries: 80,
                  maxAgeSeconds: 60 * 60 * 24 * 30,
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
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
      })
    );
  }

  return {
    base: process.env.VITE_BASE || '/',
    server: {
      host: "::",
      port: 8080,
    },
    plugins,
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
            utils: ['clsx', 'tailwind-merge', 'class-variance-authority'],
            charts: ['recharts'],
            markdown: ['react-markdown', 'remark-gfm', 'dompurify'],
          }
        }
      },
      chunkSizeWarningLimit: 1000
    }
  };
});
