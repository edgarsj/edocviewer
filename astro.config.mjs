import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import lit from '@astrojs/lit';
import AstroPWA from '@vite-pwa/astro';
import { execSync } from 'child_process';
import fs from 'fs';

// Git info for build
const getGitInfo = () => {
  try {
    return {
      commitHash: execSync('git rev-parse HEAD').toString().trim(),
      branch: execSync('git rev-parse --abbrev-ref HEAD').toString().trim(),
    };
  } catch {
    return { commitHash: 'unknown', branch: 'unknown' };
  }
};

const gitInfo = getGitInfo();
const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));

// https://astro.build/config
export default defineConfig({
  site: 'https://edocviewer.com', // Update with actual domain
  integrations: [
    tailwind({
      applyBaseStyles: false, // We handle base styles in main.css
    }),
    lit({
      // Allow Lit components to work in Astro
      include: ['**/src/components/**/*.ts'],
    }),
    AstroPWA({
      registerType: 'autoUpdate',
      srcDir: 'src/webapp',
      filename: 'service-worker.js',
      strategies: 'injectManifest',
      injectRegister: null,
      manifest: false, // We'll use public/manifest.json
      injectManifest: {
        globPatterns: [
          '**/*.{js,css,html,json,ico,svg,png,jpg,jpeg,gif,webp,woff2,ttf,eot}',
          'shoelace/assets/**/*',
        ],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
      },
      workbox: {
        navigateFallback: null, // Each page is real HTML, no SPA fallback
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'cdn-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              },
            },
          },
        ],
      },
    }),
  ],
  output: 'static',
  vite: {
    esbuild: {
      // Required for Lit decorators to work with TypeScript 5
      target: 'ES2020',
      tsconfigRaw: {
        compilerOptions: {
          experimentalDecorators: true,
          useDefineForClassFields: false,
        },
      },
    },
    resolve: {
      alias: {
        '@': '/src',
      },
    },
    define: {
      'process.env.VERSION': JSON.stringify(pkg.version),
      'process.env.COMMITHASH': JSON.stringify(gitInfo.commitHash),
      'process.env.BRANCH': JSON.stringify(gitInfo.branch),
      'process.env.BUILDDATE': JSON.stringify(
        new Date().toISOString().split('T')[0]
      ),
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
    },
    build: {
      rollupOptions: {
        output: {
          entryFileNames: 'js/[name].[hash].js',
          chunkFileNames: 'js/[name].[hash].js',
          assetFileNames: (assetInfo) => {
            if (assetInfo.name?.endsWith('.css')) {
              return 'css/[name].[hash][extname]';
            }
            return 'assets/[name].[hash][extname]';
          },
          manualChunks(id) {
            // Localization bundle (highest priority)
            if (id.includes('/src/generated/locales/')) {
              return 'localization';
            }

            // docx-preview bundle
            if (
              id.includes('node_modules/docx-preview') ||
              id.includes('node_modules/jszip')
            ) {
              return 'docx-preview-bundle';
            }

            // Web components bundle (Shoelace + Lit)
            if (
              id.includes('node_modules/@shoelace-style') ||
              id.includes('node_modules/lit') ||
              id.includes('node_modules/@lit')
            ) {
              return 'web-components';
            }

            // edockit bundle
            if (
              id.includes('node_modules/edockit') ||
              id.includes('node_modules/@peculiar/x509') ||
              id.includes('node_modules/@xmldom/xmldom') ||
              id.includes('node_modules/fflate') ||
              id.includes('node_modules/xpath')
            ) {
              return 'edockit-bundle';
            }

            // All other node_modules → vendors
            if (id.includes('node_modules')) {
              return 'vendors';
            }
          },
        },
      },
    },
  },
});
