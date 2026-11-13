import { mkdir, rm, writeFile } from "node:fs/promises";
import http from "node:http";
import https from "node:https";
import { dirname } from "node:path";
import {
  fetchTrustedListBundleWithDiagnostics,
  mergeForwardUnreachableTerritories,
} from "edockit/trusted-list/build";
import { getBundledTrustedListBundle } from "edockit/trusted-list/bundled";

// Outside public/assets: the service worker precaches files under assets/
// without a revision (they are assumed to have hashed names), so a list there
// would never be refreshed for returning visitors.
const OUTPUT_PATH = "public/trusted-list.json";
// Location used by edocviewer 1.1.0 and earlier
const LEGACY_OUTPUT_PATH = "public/assets/trusted-list.json";

// EU member states (EL = Greece) and EEA countries. Every deploy must cover
// all of them; signatures from a missing country would show "issuer not found".
const REQUIRED_TERRITORIES = [
  "AT", "BE", "BG", "CY", "CZ", "DE", "DK", "EE", "EL", "ES", "FI", "FR", "HR", "HU", "IE",
  "IT", "LT", "LU", "LV", "MT", "NL", "PL", "PT", "RO", "SE", "SI", "SK",
  "IS", "LI", "NO",
];

// Some national lists are several MB and slow to serve from build machines
const ATTEMPTS = [{ timeout: 60000 }, { timeout: 120000 }];

/**
 * Fall back to Node's http(s) client when fetch() fails or gets HTTP 403.
 * fetch() has its own connect timeout and a client fingerprint that some
 * national TSL servers reject; Node's native client is not affected.
 */
function installNativeFetchFallback(timeoutMs = 120000) {
  const originalFetch = globalThis.fetch;

  const nativeGet = (url, headers, redirects = 0) =>
    new Promise((resolve, reject) => {
      const client = url.startsWith("http://") ? http : https;
      const request = client.get(url, { headers }, (response) => {
        const status = response.statusCode ?? 0;
        if (status >= 300 && status < 400 && response.headers.location && redirects < 5) {
          response.resume();
          const next = new URL(response.headers.location, url).toString();
          resolve(nativeGet(next, headers, redirects + 1));
          return;
        }
        const chunks = [];
        response.on("data", (chunk) => chunks.push(chunk));
        response.on("end", () =>
          resolve(new Response(Buffer.concat(chunks), { status, statusText: response.statusMessage ?? "" })),
        );
        response.on("error", reject);
      });
      request.on("error", reject);
      request.setTimeout(timeoutMs, () => request.destroy(new Error(`native request timeout after ${timeoutMs}ms`)));
    });

  globalThis.fetch = async (input, init) => {
    const method = (init?.method ?? "GET").toUpperCase();
    try {
      const response = await originalFetch(input, init);
      if (response.status !== 403 || method !== "GET") {
        return response;
      }
    } catch (error) {
      if (method !== "GET") {
        throw error;
      }
    }
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    if (/^http:\/\//i.test(url)) {
      // Never downgrade: the trusted-list builder only requests https:// URLs
      throw new Error(`Refusing plain-HTTP fallback for ${url}`);
    }
    return nativeGet(url, { ...(init?.headers ?? {}) });
  };

  return () => {
    globalThis.fetch = originalFetch;
  };
}

function territoriesOf(bundle) {
  return new Set(bundle.services.map((service) => service[3]));
}

function missingTerritories(bundle) {
  const present = territoriesOf(bundle);
  return REQUIRED_TERRITORIES.filter((territory) => !present.has(territory));
}

const restoreFetch = installNativeFetchFallback();
let bundle;
let unreachable = [];
try {
  for (const [index, options] of ATTEMPTS.entries()) {
    const result = await fetchTrustedListBundleWithDiagnostics(undefined, options);
    bundle = result.bundle;
    unreachable = result.diagnostics.unreachableTerritories;
    const missing = missingTerritories(bundle);
    console.log(
      `Trusted list attempt ${index + 1}: ${bundle.services.length} services from ${territoriesOf(bundle).size} territories`,
    );
    if (unreachable.length > 0) {
      console.warn(`Trusted list download failed for: ${unreachable.join(", ")}`);
    }
    if (missing.length === 0) {
      break;
    }
    console.warn(`Trusted list is missing: ${missing.join(", ")}`);
  }
} finally {
  restoreFetch();
}

// Fill territories whose download failed (and any required territory still
// missing) from the trusted-list snapshot shipped with the installed edockit
// version (generated when that version was released). Territories that were
// downloaded but no longer list services stay removed.
const fillFromSnapshot = new Set([...unreachable, ...missingTerritories(bundle)]);
if (fillFromSnapshot.size > 0) {
  const snapshot = getBundledTrustedListBundle();
  const before = territoriesOf(bundle);
  bundle = mergeForwardUnreachableTerritories(bundle, snapshot, fillFromSnapshot);
  const carried = [...territoriesOf(bundle)].filter((territory) => !before.has(territory)).sort();
  if (carried.length > 0) {
    console.warn(
      `Carried forward ${carried.join(", ")} from edockit's trusted-list snapshot ${snapshot.bundleId} (live download failed)`,
    );
  }
}

const missing = missingTerritories(bundle);
if (missing.length > 0) {
  // Fail the build so the previous deployment stays live
  console.error(`Trusted list incomplete (missing: ${missing.join(", ")}); failing the build.`);
  process.exit(1);
}

await mkdir(dirname(OUTPUT_PATH), { recursive: true });
await rm(LEGACY_OUTPUT_PATH, { force: true });
await writeFile(OUTPUT_PATH, `${JSON.stringify(bundle)}\n`, "utf8");
console.log(
  `Trusted list bundle generated at ${OUTPUT_PATH}: ${bundle.services.length} services from ${territoriesOf(bundle).size} territories`,
);
