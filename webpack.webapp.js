import { merge } from "webpack-merge";
import { GitRevisionPlugin } from "git-revision-webpack-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";
import CopyWebpackPlugin from "copy-webpack-plugin";
import { InjectManifest } from "workbox-webpack-plugin";
import webpack from "webpack";
import path from "path";
import { fileURLToPath } from "url";
import commonConfig from "./webpack.common.js";

import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pkg = require("./package.json");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create an instance of the plugin
const gitRevisionPlugin = new GitRevisionPlugin({
  commithashCommand: "rev-parse HEAD", // Gets full commit hash
  branch: true,
});

export default merge(commonConfig, {
  entry: "./src/webapp/index.ts",
  output: {
    path: path.resolve(__dirname, "dist/webapp"),
    filename: "js/[name].[contenthash].js",
    chunkFilename: "js/[name].[contenthash].js", // For dynamically imported chunks
    clean: true,
  },
  optimization: {
    splitChunks: {
      chunks: "all",
      cacheGroups: {
        // Regular vendor chunk for other dependencies
        defaultVendors: {
          test: (module) => {
            // Return false for edockit and its dependencies
            if (
              module.resource &&
              (module.resource.includes("node_modules/edockit") ||
                module.resource.includes("node_modules/@peculiar/x509") ||
                module.resource.includes("node_modules/@xmldom/xmldom") ||
                module.resource.includes("node_modules/fflate") ||
                module.resource.includes("node_modules/xpath"))
            ) {
              return false;
            }
            // Return false for shoelace and lit - we want them in a separate bundle
            if (
              module.resource &&
              (module.resource.includes("node_modules/@shoelace-style") ||
                module.resource.includes("node_modules/lit") ||
                module.resource.includes("node_modules/@lit"))
            ) {
              return false;
            }
            // Return true for all other node_modules
            return /[\\/]node_modules[\\/]/.test(module.resource);
          },
          name: "vendors",
          chunks: "all",
          priority: 10,
        },
        // Create a separate chunk for edockit and its dependencies
        edockitBundle: {
          test: (module) => {
            return (
              module.resource &&
              (module.resource.includes("node_modules/edockit") ||
                module.resource.includes("node_modules/@peculiar/x509") ||
                module.resource.includes("node_modules/@xmldom/xmldom") ||
                module.resource.includes("node_modules/fflate") ||
                module.resource.includes("node_modules/xpath"))
            );
          },
          name: "edockit-bundle",
          chunks: "all",
          priority: 20, // Higher priority than vendors
        },
        // Create a separate chunk for shoelace and lit
        webComponentsBundle: {
          test: (module) => {
            return (
              module.resource &&
              (module.resource.includes("node_modules/@shoelace-style") ||
                module.resource.includes("node_modules/lit") ||
                module.resource.includes("node_modules/@lit"))
            );
          },
          name: "web-components",
          chunks: "all",
          priority: 25, // Higher priority than edockit
        },
        // Create a special chunk for localization files
        localizationBundle: {
          test: (module) => {
            return (
              module.resource &&
              module.resource.includes("/src/generated/locales/")
            );
          },
          name: "localization",
          chunks: "all",
          priority: 30, // Higher priority than other chunks
        },
      },
    },
  },
  module: {
    rules: [
      // Make sure TypeScript in the generated locales directory is processed
      {
        test: /\.ts$/,
        include: [path.resolve(__dirname, "src/generated/locales")],
        use: {
          loader: "ts-loader",
          options: {
            transpileOnly: true,
            compilerOptions: {
              noEmit: false,
              module: "ESNext",
            },
          },
        },
      },
    ],
  },
  plugins: [
    gitRevisionPlugin,
    // Add the DefinePlugin to make variables available
    new webpack.DefinePlugin({
      "process.env.VERSION": JSON.stringify(pkg.version),
      "process.env.COMMITHASH": JSON.stringify(gitRevisionPlugin.commithash()),
      "process.env.BRANCH": JSON.stringify(gitRevisionPlugin.branch()),
      "process.env.BUILDDATE": JSON.stringify(
        new Date().toISOString().split("T")[0],
      ),
    }),
    new HtmlWebpackPlugin({
      template: "./public/index.html",
      filename: "index.html",
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "public",
          to: ".",
          globOptions: {
            ignore: ["**/index.html", "**/.DS_Store"],
          },
        },
        {
          from: "./src/webapp/manifest.json",
          to: "manifest.json",
          transform(content) {
            // This ensures the manifest is valid JSON
            const manifest = JSON.parse(content.toString());
            return JSON.stringify(manifest, null, 2);
          },
        },
        // Copy Shoelace assets
        {
          from: "./node_modules/@shoelace-style/shoelace/dist/assets",
          to: "shoelace/assets",
        },
      ],
    }),
    // Use InjectManifest to generate service worker with precached assets
    new InjectManifest({
      swSrc: "./src/webapp/service-worker.js",
      swDest: "service-worker.js",
      // Prevent cache-busting for Shoelace assets
      dontCacheBustURLsMatching: /shoelace\/assets\/.*/,
      include: [
        /\.(js|css|html|json|ico|svg|png|jpg|jpeg|gif|webp|woff2?|ttf|eot)$/,
        /shoelace\/assets\/.*/,
        /\/?$/,
        /\/index\.html$/,
      ],
      maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, "public"),
      publicPath: "/",
      watch: true,
    },
    compress: true,
    port: 8080,
    hot: true,
    // Allow requests from any origin during development
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  },
  // Add the `src/generated` directory to the resolve.modules to help locate imports
  resolve: {
    modules: [
      "node_modules",
      path.resolve(__dirname, "src"),
      path.resolve(__dirname, "src/generated"),
    ],
  },
});
