/**
 * CORS proxy for OCSP/CRL certificate revocation checks
 * Only allows requests from edocviewer origins to known certificate infrastructure
 */

const ALLOWED_ORIGINS = [
  'https://edocviewer.app',
  'https://www.edocviewer.app',
  'http://localhost:8080',
];

// Cloudflare Pages preview deployments pattern
const PAGES_PREVIEW_PATTERN = /^https:\/\/[a-z0-9]+\.edocviewer\.pages\.dev$/;

// Only proxy to known certificate infrastructure domains
const ALLOWED_DEST_PATTERNS = [
  /^https?:\/\/[^/]*\.sk\.ee\//,                    // Estonian SK (SK ID Solutions)
  /^https?:\/\/ocsp\.[^/]+\//,                      // OCSP responders
  /^https?:\/\/[^/]+\/.*\.(crl|crt|cer|der)(\?.*)?$/i,  // CRL/cert files
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
  async fetch(request: Request): Promise<Response> {
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
      return new Response('Destination not allowed', { status: 400 });
    }

    try {
      // Fetch the certificate/CRL
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'edocviewer-cors-proxy/1.0',
        },
      });

      // Return with CORS headers
      return new Response(response.body, {
        status: response.status,
        headers: {
          'Access-Control-Allow-Origin': origin!,
          'Content-Type':
            response.headers.get('Content-Type') || 'application/octet-stream',
          'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        },
      });
    } catch (error) {
      return new Response(`Proxy error: ${(error as Error).message}`, {
        status: 502,
      });
    }
  },
};
