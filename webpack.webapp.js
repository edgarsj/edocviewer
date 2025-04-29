import { merge } from "webpack-merge";
import HtmlWebpackPlugin from "html-webpack-plugin";
import CopyWebpackPlugin from "copy-webpack-plugin";
import { InjectManifest } from "workbox-webpack-plugin";
import path from "path";
import { fileURLToPath } from "url";
import commonConfig from "./webpack.common.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
      },
    },
  },
  plugins: [
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
            ignore: ["**/index.html"],
          },
        },
        {
          from: "./src/webapp/manifest.json",
          to: "manifest.json",
        },
      ],
    }),
    // Use InjectManifest to generate service worker with precached assets
    new InjectManifest({
      swSrc: "./src/webapp/service-worker.js",
      swDest: "service-worker.js",
      maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, "public"),
    },
    compress: true,
    port: 8080,
    hot: true,
    // Allow requests from any origin during development
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  },
});
