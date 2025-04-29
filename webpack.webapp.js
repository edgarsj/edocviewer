import { merge } from "webpack-merge";
import HtmlWebpackPlugin from "html-webpack-plugin";
import CopyWebpackPlugin from "copy-webpack-plugin";
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
    clean: true,
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
        // Copy PWA files
        {
          from: "./src/webapp/manifest.json",
          to: "manifest.json",
        },
        {
          from: "./src/webapp/service-worker.js",
          to: "service-worker.js",
        },
      ],
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
