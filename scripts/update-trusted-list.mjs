import { createRequire } from "module";

// edockit's bundled code uses require() for @xmldom/xmldom detection.
// In ESM-only projects, require() isn't available by default, so we
// provide it globally before importing edockit.
globalThis.require = createRequire(import.meta.url);

const { generateTrustedListBundle } = await import("edockit/trusted-list/build");

await generateTrustedListBundle({
  outputPath: "public/assets/trusted-list.json",
});

console.log("Trusted list bundle generated at public/assets/trusted-list.json");
