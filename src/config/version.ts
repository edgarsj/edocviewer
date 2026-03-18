export const VERSION = {
  number: process.env.VERSION || "1.0.1",
  commit: process.env.COMMITHASH || "development",
  branch: process.env.BRANCH || "main",
  buildDate: process.env.BUILDDATE || "2025-04-30",
};
