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
  if (lowerUrl.match(/\.(crt|cer|der)$/)) {
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

// Only proxy to known certificate infrastructure domains
const ALLOWED_DEST_PATTERNS = [
  // Latvian eParaksts (LVRTC)
  /^https?:\/\/(www\.)?eparaksts\.lv\//,            // eparaksts.lv (certs, CRLs)
  /^https?:\/\/ocsp\.eparaksts\.lv(\/|$)/,          // OCSP responder

  // Estonian SK ID Solutions
  /^https?:\/\/c\.sk\.ee\//,                        // CA certificates
  /^https?:\/\/aia\.sk\.ee\//,                      // AIA (issuer certs)
  /^https?:\/\/www\.sk\.ee\/crls\//,                // CRLs
  /^https?:\/\/ocsp\.sk\.ee(\/|$)/,                 // OCSP responder

  // Ukrainian Diia (government CA)
  /^https?:\/\/ca\.diia\.gov\.ua\//,                // CA services (certs, OCSP, CRLs)

  // Generic patterns for other EU trust services
  /^https?:\/\/ocsp[^/]*\.[^/]+(\/|$)/,             // OCSP responders (ocsp*)
  /^https?:\/\/aia\.[^/]+\//,                       // AIA endpoints (aia.*)
  /^https?:\/\/[^/]+\/.*\.(crl|crt|cer|der)(\?.*)?$/i,  // CRL/cert files by extension
];

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  if (PAGES_PREVIEW_PATTERN.test(origin)) return true;
  return false;
}

function isAllowedDestination(url: string): boolean {
  return ALLOWED_DEST_PATTERNS.some((pattern) => pattern.test(url));
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

    // Check Origin header (browsers can't spoof this)
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
    const url = new URL(request.url).searchParams.get('url');
    if (!url) {
      return corsError('Missing url parameter', 400, origin!);
    }

    if (!isAllowedDestination(url)) {
      logToAxiom(env, ctx, 'blocked', url, request.method);
      return corsError('Destination not allowed', 400, origin!);
    }

    try {
      const cache = caches.default;
      const isPost = request.method === 'POST';
      let response: Response | undefined;

      // Only use cache for GET requests (POST responses depend on request body)
      if (!isPost) {
        const cacheKey = new Request(new URL(request.url).toString(), request);
        response = await cache.match(cacheKey);
      }

      if (!response) {
        // Cache miss or POST - fetch from origin
        const fetchOptions: RequestInit = {
          method: request.method,
          headers: {
            'User-Agent': 'edocviewer-cors-proxy/1.0',
          },
        };

        // Forward Content-Type and body for POST requests
        if (isPost) {
          const contentType = request.headers.get('Content-Type');
          if (contentType) {
            (fetchOptions.headers as Record<string, string>)['Content-Type'] = contentType;
          }
          fetchOptions.body = await request.arrayBuffer();
        }

        const originResponse = await fetch(url, fetchOptions);

        const ttl = getCacheTtl(url);

        // Create response with cache headers
        response = new Response(originResponse.body, {
          status: originResponse.status,
          headers: {
            'Content-Type':
              originResponse.headers.get('Content-Type') ||
              'application/octet-stream',
            'Cache-Control': isPost ? 'no-store' : `public, max-age=${ttl}`,
          },
        });

        // Store in edge cache (only cache successful GET responses)
        if (!isPost && originResponse.status === 200) {
          const cacheKey = new Request(new URL(request.url).toString(), request);
          await cache.put(cacheKey, response.clone());
        }
      }

      // Add CORS headers to response
      const corsResponse = new Response(response.body, {
        status: response.status,
        headers: response.headers,
      });
      corsResponse.headers.set('Access-Control-Allow-Origin', origin!);

      logToAxiom(env, ctx, 'accessed', url, request.method);
      return corsResponse;
    } catch (error) {
      return corsError(`Proxy error: ${(error as Error).message}`, 502, origin!);
    }
  },
};
