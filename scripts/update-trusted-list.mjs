import { readFile, writeFile } from "node:fs/promises";
import http from "node:http";
import https from "node:https";
import { fileURLToPath } from "node:url";
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

/**
 * Trusted-list snapshot shipped with the installed edockit version (generated
 * when that version was released). Returns null if it cannot be read.
 * TODO: use a public export once edockit provides one.
 */
async function loadEdockitSnapshot() {
  try {
    const file = fileURLToPath(import.meta.resolve("edockit/trusted-list/bundled"));
    const source = await readFile(file, "utf8");
    const match = source.match(/^const trustedListBundle = (\{.*\});$/m);
    return match ? JSON.parse(match[1]) : null;
  } catch (error) {
    console.warn(`Could not read edockit's trusted-list snapshot: ${error.message}`);
    return null;
  }
}

/** Copy the services of `territories` from `snapshot` into `bundle`. */
function carryForward(bundle, snapshot, territories) {
  const wanted = new Set(territories);
  const dns = [...bundle.dns];
  const dnIndex = new Map(dns.map((dn, index) => [dn, index]));
  const sourceIndex = new Map(bundle.sources.map(([id], index) => [id, index]));
  const carried = snapshot.services
    .filter((service) => wanted.has(service[3]))
    .map((service) => {
      const dn = snapshot.dns[service[2]];
      if (!dnIndex.has(dn)) {
        dnIndex.set(dn, dns.length);
        dns.push(dn);
      }
      const record = [service[0], service[1], dnIndex.get(dn), service[3], service[4], service[5]];
      const sourceId = service[6] !== undefined ? snapshot.sources[service[6]]?.[0] : undefined;
      if (sourceId !== undefined && sourceIndex.has(sourceId)) {
        record.push(sourceIndex.get(sourceId));
      }
      return record;
    });
  return { ...bundle, dns, services: [...bundle.services, ...carried] };
}

const restoreFetch = installNativeFetchFallback();
let bundle;
try {
  for (const [index, options] of ATTEMPTS.entries()) {
    const result = await generateTrustedListBundle({ outputPath: OUTPUT_PATH, ...options });
    bundle = result.bundle;
    const missing = missingTerritories(bundle);
    console.log(
      `Trusted list attempt ${index + 1}: ${bundle.services.length} services from ${territoriesOf(bundle).size} territories`,
    );
    if (missing.length === 0) {
      break;
    }
    console.warn(`Trusted list is missing: ${missing.join(", ")}`);
  }
} finally {
  restoreFetch();
}

let missing = missingTerritories(bundle);
if (missing.length > 0) {
  const snapshot = await loadEdockitSnapshot();
  const available = snapshot ? missing.filter((territory) => territoriesOf(snapshot).has(territory)) : [];
  if (available.length > 0) {
    bundle = carryForward(bundle, snapshot, available);
    await writeFile(OUTPUT_PATH, `${JSON.stringify(bundle)}\n`, "utf8");
    console.warn(
      `Carried forward ${available.join(", ")} from edockit's trusted-list snapshot ${snapshot.bundleId} (live download failed)`,
    );
  }
  missing = missingTerritories(bundle);
}

if (missing.length > 0) {
  // Fail the build so the previous deployment stays live
  console.error(`Trusted list incomplete (missing: ${missing.join(", ")}); failing the build.`);
  process.exit(1);
}

console.log(
  `Trusted list bundle generated at ${OUTPUT_PATH}: ${bundle.services.length} services from ${territoriesOf(bundle).size} territories`,
);
