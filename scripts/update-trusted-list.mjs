import { generateTrustedListBundle } from "edockit/trusted-list/build";

await generateTrustedListBundle({
  outputPath: "public/assets/trusted-list.json",
});

console.log("Trusted list bundle generated at public/assets/trusted-list.json");
