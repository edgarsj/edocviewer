import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { execSync } from "child_process";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Git info for build
const getGitInfo = () => {
  try {
    return {
      commitHash: execSync("git rev-parse HEAD").toString().trim(),
      branch: execSync("git rev-parse --abbrev-ref HEAD").toString().trim(),
    };
  } catch {
    return { commitHash: "unknown", branch: "unknown" };
  }
};

const gitInfo = getGitInfo();
const pkg = JSON.parse(fs.readFileSync("./package.json", "utf-8"));

export default defineConfig(({ mode }) => ({
  root: ".",
  publicDir: "public",

  esbuild: {
    // Required for Lit decorators to work with TypeScript 5
    target: "ES2020",
    tsconfigRaw: {
      compilerOptions: {
        experimentalDecorators: true,
        useDefineForClassFields: false,
      },
    },
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },

  define: {
    "process.env.VERSION": JSON.stringify(pkg.version),
    "process.env.COMMITHASH": JSON.stringify(gitInfo.commitHash),
    "process.env.BRANCH": JSON.stringify(gitInfo.branch),
    "process.env.BUILDDATE": JSON.stringify(
      new Date().toISOString().split("T")[0]
    ),
    "process.env.NODE_ENV": JSON.stringify(mode),
  },

  build: {
    outDir: "dist/webapp",
    emptyOutDir: true,
    rollupOptions: {
      input: "./index.html",
      output: {
        entryFileNames: "js/[name].[hash].js",
        chunkFileNames: "js/[name].[hash].js",
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith(".css")) {
            return "css/[name].[hash][extname]";
          }
          return "assets/[name].[hash][extname]";
        },
        manualChunks(id) {
          // Localization bundle (highest priority)
          if (id.includes("/src/generated/locales/")) {
            return "localization";
          }

          // docx-preview bundle
          if (
            id.includes("node_modules/docx-preview") ||
            id.includes("node_modules/jszip")
          ) {
            return "docx-preview-bundle";
          }

          // Web components bundle (Shoelace + Lit)
          if (
            id.includes("node_modules/@shoelace-style") ||
            id.includes("node_modules/lit") ||
            id.includes("node_modules/@lit")
          ) {
            return "web-components";
          }

          // edockit bundle
          if (
            id.includes("node_modules/edockit") ||
            id.includes("node_modules/@peculiar/x509") ||
            id.includes("node_modules/@xmldom/xmldom") ||
            id.includes("node_modules/fflate") ||
            id.includes("node_modules/xpath")
          ) {
            return "edockit-bundle";
          }

          // All other node_modules → vendors
          if (id.includes("node_modules")) {
            return "vendors";
          }
        },
      },
    },
  },

  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: "node_modules/@shoelace-style/shoelace/dist/assets/**/*",
          dest: "shoelace/assets",
        },
      ],
    }),

    VitePWA({
      srcDir: "src/webapp",
      filename: "service-worker.js",
      strategies: "injectManifest",
      injectRegister: null,
      injectManifest: {
        globPatterns: [
          "**/*.{js,css,html,json,ico,svg,png,jpg,jpeg,gif,webp,woff2,ttf,eot}",
          "shoelace/assets/**/*",
        ],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
      },
    }),
  ],

  server: {
    port: 8080,
    host: true,
    cors: true,
  },
}));
