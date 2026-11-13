/**
 * CORS proxy for OCSP/CRL certificate revocation checks
 * Only allows requests from edocviewer origins to known certificate infrastructure
 */

interface Env {
  AXIOM_TOKEN?: string;
}

// Fire-and-forget logging to Axiom for full URL analysis - never blocks or fails the response
function logToAxiom(env: Env, ctx: ExecutionContext, type: 'blocked' | 'accessed', url: string, method: string) {
  if (!env.AXIOM_TOKEN) return;

  ctx.waitUntil(fetch('https://eu-central-1.aws.edge.axiom.co/v1/ingest/edocviewer-proxy', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.AXIOM_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify([{ type, url, method, _time: new Date().toISOString() }])
  }).catch(() => {}));
}

// Cache TTLs in seconds
const CACHE_TTL = {
  crl: 6 * 60 * 60,      // 6 hours for CRLs
  cert: 24 * 60 * 60,    // 24 hours for CA certificates
  ocsp: 10 * 60,         // 10 minutes for OCSP responses
  default: 60 * 60,      // 1 hour fallback
};

function getCacheTtl(url: string): number {
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes('/ocsp') || lowerUrl.includes('ocsp.')) {
    return CACHE_TTL.ocsp;
  }
  if (lowerUrl.endsWith('.crl')) {
    return CACHE_TTL.crl;
  }
  if (lowerUrl.match(/\.(crt|cer|der|p7c)$/)) {
    return CACHE_TTL.cert;
  }
  return CACHE_TTL.default;
}

const ALLOWED_ORIGINS = [
  'https://edocviewer.app',
  'https://www.edocviewer.app',
  'http://localhost:8080',
];

// Cloudflare Pages preview deployments pattern (includes hyphens for branch names)
const PAGES_PREVIEW_PATTERN = /^https:\/\/[a-z0-9-]+\.edocviewer\.pages\.dev$/;

// Known certificate infrastructure hosts. An entry matches the hostname itself
// and its subdomains ("eparaksts.lv" matches "www.eparaksts.lv").
const ALLOWED_HOSTS = [
  // Latvian eParaksts (LVRTC)
  'eparaksts.lv',
  // Estonian SK ID Solutions
  'sk.ee',
  // Ukrainian CAs (Diia, Informjust)
  'ca.diia.gov.ua',
  'ca.informjust.ua',
  // Slovak SNCA (National Security Authority CA)
  'snca.gov.sk',
  // Hungarian Microsec (government CA)
  'hiteles.gov.hu',
  // Hungarian Netlock (qualified trust services)
  'netlock.hu',
  // Lithuanian VRM (government CA)
  'nsc.vrm.lt',
  // Slovak/Czech Ardaco (TSP/OCSP)
  'tsp.ardaco.com',
  // Polish Eurocert
  'services.eurocert.pl',
  // FreeTSA (open timestamp authority)
  'www.freetsa.org',
];

// File types served by CRL distribution points and AIA CA-issuer endpoints
const CERT_OR_CRL_PATH = /\.(crl|crt|cer|der|p7c|pem)$/i;

const MAX_REDIRECTS = 3;
// Large national CRLs exist (the Estonian ID card CRL is ~18 MB)
const MAX_RESPONSE_BYTES = 50 * 1024 * 1024;
const ALLOWED_PORTS = new Set(['', '80', '443', '8080']);

// Response types passed through as-is; anything else is served as octet-stream
const SAFE_CONTENT_TYPES = new Set([
  'application/ocsp-response',
  'application/pkix-crl',
  'application/pkix-cert',
  'application/x-x509-ca-cert',
  'application/pkcs7-mime',
  'application/x-pkcs7-certificates',
  'application/x-pkcs7-crl',
  'application/octet-stream',
]);

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  if (PAGES_PREVIEW_PATTERN.test(origin)) return true;
  return false;
}

function hostMatches(hostname: string, allowed: string): boolean {
  return hostname === allowed || hostname.endsWith(`.${allowed}`);
}

function parseDestination(raw: string): URL | null {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
  if (url.username || url.password) return null;
  if (!ALLOWED_PORTS.has(url.port)) return null;
  const hostname = url.hostname.toLowerCase();
  // No IP literals or single-label / local names
  if (/^[\d.]+$/.test(hostname) || hostname.includes(':') || !hostname.includes('.')) return null;
  if (hostname === 'localhost' || hostname.endsWith('.localhost') || hostname.endsWith('.local')) {
    return null;
  }
  return url;
}

/**
 * Decide whether a request may be proxied to `url`.
 * - Known certificate infrastructure hosts: GET and OCSP POST
 * - Other hosts: OCSP POST to an OCSP-looking host, or GET of a certificate/CRL file
 */
function isAllowedDestination(url: URL, method: string, contentType: string | null): boolean {
  const hostname = url.hostname.toLowerCase();
  const isOcspPost = method === 'POST' && contentType === 'application/ocsp-request';

  if (method === 'POST' && !isOcspPost) return false;

  if (ALLOWED_HOSTS.some((allowed) => hostMatches(hostname, allowed))) {
    return true;
  }

  if (isOcspPost) {
    return hostname.split('.').some((label) => label.includes('ocsp')) || /ocsp/i.test(url.pathname);
  }

  return (
    CERT_OR_CRL_PATH.test(url.pathname) ||
    hostname.startsWith('aia.') ||
    hostname.startsWith('crl.')
  );
}

function safeContentType(value: string | null): string {
  const type = (value || '').split(';')[0].trim().toLowerCase();
  return SAFE_CONTENT_TYPES.has(type) ? type : 'application/octet-stream';
}

function corsError(message: string, status: number, origin: string): Response {
  return new Response(message, {
    status,
    headers: { 'Access-Control-Allow-Origin': origin },
  });
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const origin = request.headers.get('Origin');

    // Check Origin header. This only keeps other websites from using the proxy
    // from a browser; non-browser clients can send any Origin, so the
    // destination checks below are what actually limit the proxy.
    if (!isAllowedOrigin(origin)) {
      return new Response('Forbidden', { status: 403 });
    }

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': origin!,
          'Access-Control-Allow-Methods': 'GET, POST',
          'Access-Control-Allow-Headers': 'Content-Type, Accept',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // Only allow GET and POST requests
    if (request.method !== 'GET' && request.method !== 'POST') {
      return corsError('Method not allowed', 405, origin!);
    }

    // Get and validate destination URL
    const rawUrl = new URL(request.url).searchParams.get('url');
    if (!rawUrl) {
      return corsError('Missing url parameter', 400, origin!);
    }

    const contentType = request.headers.get('Content-Type');
    const destination = parseDestination(rawUrl);
    if (!destination || !isAllowedDestination(destination, request.method, contentType)) {
      logToAxiom(env, ctx, 'blocked', rawUrl, request.method);
      return corsError('Destination not allowed', 400, origin!);
    }

    try {
      const cache = caches.default;
      const isPost = request.method === 'POST';
      let response: Response | undefined;

      // Only use cache for GET requests (POST responses depend on request body)
      const cacheKey = new Request(new URL(request.url).toString(), { method: 'GET' });
      if (!isPost) {
        response = await cache.match(cacheKey);
      }

      if (!response) {
        const body = isPost ? await request.arrayBuffer() : undefined;
        if (body && body.byteLength > 64 * 1024) {
          return corsError('Request too large', 413, origin!);
        }

        // Follow redirects manually so every hop is checked against the allowlist
        let target = destination;
        let method = request.method;
        let originResponse: Response | undefined;
        for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
          originResponse = await fetch(target.toString(), {
            method,
            redirect: 'manual',
            headers: {
              'User-Agent': 'edocviewer-cors-proxy/1.0',
              ...(method === 'POST' && contentType ? { 'Content-Type': contentType } : {}),
            },
            body: method === 'POST' ? body : undefined,
          });

          const location = originResponse.headers.get('Location');
          if (originResponse.status < 300 || originResponse.status >= 400 || !location) {
            break;
          }
          if (hop === MAX_REDIRECTS) {
            return corsError('Too many redirects', 502, origin!);
          }
          const next = parseDestination(new URL(location, target).toString());
          // 303 (and historically 301/302) turn POST into GET
          const nextMethod =
            method === 'POST' && [301, 302, 303].includes(originResponse.status) ? 'GET' : method;
          if (!next || !isAllowedDestination(next, nextMethod, contentType)) {
            logToAxiom(env, ctx, 'blocked', location, nextMethod);
            return corsError('Redirect destination not allowed', 502, origin!);
          }
          target = next;
          method = nextMethod;
        }

        const declaredLength = Number(originResponse!.headers.get('Content-Length') || 0);
        if (declaredLength > MAX_RESPONSE_BYTES) {
          return corsError('Response too large', 502, origin!);
        }
        const data = await originResponse!.arrayBuffer();
        if (data.byteLength > MAX_RESPONSE_BYTES) {
          return corsError('Response too large', 502, origin!);
        }

        const ttl = getCacheTtl(destination.toString());

        response = new Response(data, {
          status: originResponse!.status,
          headers: {
            'Content-Type': safeContentType(originResponse!.headers.get('Content-Type')),
            'Cache-Control': isPost ? 'no-store' : `public, max-age=${ttl}`,
          },
        });

        // Store in edge cache (only cache successful GET responses)
        if (!isPost && originResponse!.status === 200) {
          ctx.waitUntil(cache.put(cacheKey, response.clone()));
        }
      }

      // Add CORS and safety headers to response
      const corsResponse = new Response(response.body, {
        status: response.status,
        headers: response.headers,
      });
      corsResponse.headers.set('Access-Control-Allow-Origin', origin!);
      corsResponse.headers.set('Vary', 'Origin');
      corsResponse.headers.set('X-Content-Type-Options', 'nosniff');
      corsResponse.headers.set('Content-Security-Policy', "default-src 'none'; sandbox");
      corsResponse.headers.set('Content-Disposition', 'attachment');

      logToAxiom(env, ctx, 'accessed', destination.toString(), request.method);
      return corsResponse;
    } catch (error) {
      return corsError(`Proxy error: ${(error as Error).message}`, 502, origin!);
    }
  },
};
