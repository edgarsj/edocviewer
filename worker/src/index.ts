/**
 * CORS proxy for OCSP/CRL certificate revocation checks
 * Only allows requests from edocviewer origins to known certificate infrastructure
 */

interface Env {
  AXIOM_TOKEN?: string;
}

// Fire-and-forget logging to Plausible - never blocks or fails the response
function logToPlausible(ctx: ExecutionContext, type: 'blocked' | 'accessed', url: string) {
  ctx.waitUntil(fetch('https://n.zenomy.tech/api/event', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'edocviewer-cors-proxy/1.0',
    },
    body: JSON.stringify({
      name: `proxy-${type}`,
      url: 'https://edocviewer.app/cors-proxy',
      domain: 'edocviewer.app',
      props: { target: new URL(url).hostname }
    })
  }).catch(() => {}));
}

// Fire-and-forget logging to Axiom for full URL analysis - never blocks or fails the response
function logToAxiom(env: Env, ctx: ExecutionContext, type: 'blocked' | 'accessed', url: string) {
  if (!env.AXIOM_TOKEN) return;

  ctx.waitUntil(fetch('https://api.axiom.co/v1/datasets/edocviewer-proxy/ingest', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.AXIOM_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify([{ type, url, _time: new Date().toISOString() }])
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
  /^https?:\/\/www\.sk\.ee\/crls\//,                // CRLs
  /^https?:\/\/ocsp\.sk\.ee(\/|$)/,                 // OCSP responder

  // Generic patterns for other EU trust services
  /^https?:\/\/ocsp\.[^/]+\//,                      // OCSP responders (ocsp.*)
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
          'Access-Control-Allow-Methods': 'GET',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // Only allow GET requests
    if (request.method !== 'GET') {
      return new Response('Method not allowed', { status: 405 });
    }

    // Get and validate destination URL
    const url = new URL(request.url).searchParams.get('url');
    if (!url) {
      return new Response('Missing url parameter', { status: 400 });
    }

    if (!isAllowedDestination(url)) {
      logToPlausible(ctx, 'blocked', url);
      logToAxiom(env, ctx, 'blocked', url);
      return new Response('Destination not allowed', { status: 400 });
    }

    try {
      // Create cache key based on destination URL
      const cacheKey = new Request(new URL(request.url).toString(), request);
      const cache = caches.default;

      // Check edge cache first
      let response = await cache.match(cacheKey);

      if (!response) {
        // Cache miss - fetch from origin
        const originResponse = await fetch(url, {
          headers: {
            'User-Agent': 'edocviewer-cors-proxy/1.0',
          },
        });

        const ttl = getCacheTtl(url);

        // Create response with cache headers
        response = new Response(originResponse.body, {
          status: originResponse.status,
          headers: {
            'Content-Type':
              originResponse.headers.get('Content-Type') ||
              'application/octet-stream',
            'Cache-Control': `public, max-age=${ttl}`,
          },
        });

        // Store in edge cache (only cache successful responses)
        if (originResponse.status === 200) {
          // Clone response before caching (body can only be read once)
          await cache.put(cacheKey, response.clone());
        }
      }

      // Add CORS headers to response
      const corsResponse = new Response(response.body, {
        status: response.status,
        headers: response.headers,
      });
      corsResponse.headers.set('Access-Control-Allow-Origin', origin!);

      logToPlausible(ctx, 'accessed', url);
      return corsResponse;
    } catch (error) {
      return new Response(`Proxy error: ${(error as Error).message}`, {
        status: 502,
      });
    }
  },
};
