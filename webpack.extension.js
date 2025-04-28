import { merge } from "webpack-merge";
import HtmlWebpackPlugin from "html-webpack-plugin";
import CopyWebpackPlugin from "copy-webpack-plugin";
import path from "path";
import { fileURLToPath } from "url";
import commonConfig from "./webpack.common.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default merge(commonConfig, {
  entry: {
    background: "./src/extension/background.ts",
    popup: "./src/extension/popup.ts",
    viewer: "./src/webapp/app.ts",
  },
  output: {
    path: path.resolve(__dirname, "dist/extension"),
    filename: "[name].js",
    clean: true,
  },
  plugins: [
    // Popup HTML
    new HtmlWebpackPlugin({
      template: "./src/extension/popup.html",
      filename: "popup.html",
      chunks: ["popup"],
    }),
    // Viewer HTML
    new HtmlWebpackPlugin({
      template: "./public/index.html",
      filename: "viewer.html",
      chunks: ["viewer"],
    }),
    // Copy static assets
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "public/icons",
          to: "icons",
        },
        {
          from: "src/extension/manifest.json",
          to: "manifest.json",
        },
      ],
    }),
  ],
});
