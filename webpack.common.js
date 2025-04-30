import path from "path";
import { fileURLToPath } from "url";
import MiniCssExtractPlugin from "mini-css-extract-plugin";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: {
          loader: "ts-loader",
          options: {
            transpileOnly: true, // Speed up compilation and let webpack report errors
            compilerOptions: {
              noEmit: false,
              module: "ESNext",
            },
          },
        },
        exclude: (modulePath) => {
          // Don't exclude the generated/locales directory
          if (modulePath.includes("/src/generated/locales/")) {
            return false;
          }
          return /node_modules/.test(modulePath);
        },
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            options: {
              importLoaders: 1,
            },
          },
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: ["tailwindcss", "autoprefixer"],
              },
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "css/[name].[contenthash].css",
    }),
  ],
  resolve: {
    extensions: [".ts", ".js"],
    alias: {
      "@": path.resolve(__dirname, "src"),
      // Add an alias for generated files
      locales: path.resolve(__dirname, "src/generated/locales"),
    },
    fallback: {
      crypto: false,
    },
  },
};
