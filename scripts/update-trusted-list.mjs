import { generateTrustedListBundle } from "edockit/trusted-list/build";

const OUTPUT_PATH = "public/assets/trusted-list.json";

// EU member states (EL = Greece) and EEA countries. Every deploy must cover
// all of them; signatures from a missing country would show "issuer not found".
const REQUIRED_TERRITORIES = [
  "AT", "BE", "BG", "CY", "CZ", "DE", "DK", "EE", "EL", "ES", "FI", "FR", "HR", "HU", "IE",
  "IT", "LT", "LU", "LV", "MT", "NL", "PL", "PT", "RO", "SE", "SI", "SK",
  "IS", "LI", "NO",
];

// Some national lists are several MB and slow to serve from build machines
const ATTEMPTS = [{ timeout: 60000 }, { timeout: 120000 }];

function missingTerritories(bundle) {
  const present = new Set(bundle.services.map((service) => service[3]));
  return REQUIRED_TERRITORIES.filter((territory) => !present.has(territory));
}

let missing = REQUIRED_TERRITORIES;
for (const [index, options] of ATTEMPTS.entries()) {
  const result = await generateTrustedListBundle({ outputPath: OUTPUT_PATH, ...options });
  missing = missingTerritories(result.bundle);
  const territories = new Set(result.bundle.services.map((service) => service[3])).size;
  console.log(
    `Trusted list attempt ${index + 1}: ${result.bundle.services.length} services from ${territories} territories`,
  );
  if (missing.length === 0) {
    break;
  }
  console.warn(`Trusted list is missing: ${missing.join(", ")}`);
}

if (missing.length > 0) {
  // Fail the build so the previous deployment (with complete data) stays live
  console.error(
    `Trusted list incomplete after ${ATTEMPTS.length} attempts (missing: ${missing.join(", ")}); failing the build.`,
  );
  process.exit(1);
}

console.log(`Trusted list bundle generated at ${OUTPUT_PATH}`);
