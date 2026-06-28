// ============================================================
// ClimaSense — API Security Middleware
// Provides CORS enforcement, input validation, and rate-limit
// headers for all serverless API routes.
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

// ─── Allowed Origins ─────────────────────────────────────────
// Add your production domain(s) here before deploying.
const ALLOWED_ORIGINS = new Set([
  // Production
  // 'https://atmosiq.vercel.app',
  // 'https://your-custom-domain.com',

  // Development
  'http://localhost:3000',
  'http://127.0.0.1:3000',
]);

/**
 * Validates the request origin against the allowlist.
 * Returns the origin string if allowed, or null if blocked.
 */
export function getAllowedOrigin(request: NextRequest): string | null {
  const origin = request.headers.get('origin');

  // Same-origin requests (no Origin header) are always allowed
  if (!origin) return null;

  // In development, allow all localhost ports
  if (process.env.NODE_ENV === 'development' && (
    origin.startsWith('http://localhost:') ||
    origin.startsWith('http://127.0.0.1:')
  )) {
    return origin;
  }

  return ALLOWED_ORIGINS.has(origin) ? origin : '__BLOCKED__';
}

/**
 * Builds CORS headers for a response.
 */
export function corsHeaders(origin: string | null): Record<string, string> {
  if (!origin || origin === '__BLOCKED__') return {};
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

/**
 * Handles CORS preflight (OPTIONS) requests.
 */
export function handlePreflight(request: NextRequest): NextResponse | null {
  if (request.method !== 'OPTIONS') return null;

  const origin = getAllowedOrigin(request);
  if (origin === '__BLOCKED__') {
    return new NextResponse(null, { status: 403 });
  }

  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(origin),
  });
}

/**
 * Wraps a NextResponse with CORS headers.
 */
export function withCors(response: NextResponse, request: NextRequest): NextResponse {
  const origin = getAllowedOrigin(request);
  if (origin && origin !== '__BLOCKED__') {
    const headers = corsHeaders(origin);
    for (const [key, value] of Object.entries(headers)) {
      response.headers.set(key, value);
    }
  }
  return response;
}

// ─── Input Validators ────────────────────────────────────────

/** Sanitize and validate a location string */
export function sanitizeLocation(raw: string | null): string {
  if (!raw) return 'Houston';
  // Strip control characters, limit length, allow only safe chars
  const cleaned = raw
    .replace(/[^\p{L}\p{N}\s,.\-']/gu, '')
    .trim()
    .slice(0, 100);
  return cleaned || 'Houston';
}

/** Validate lat/lng are within valid geographic bounds */
export function validateCoords(
  latRaw: string | null,
  lngRaw: string | null
): { lat: number; lng: number } | null {
  if (!latRaw || !lngRaw) return null;
  const lat = parseFloat(latRaw);
  const lng = parseFloat(lngRaw);
  if (
    Number.isNaN(lat) || Number.isNaN(lng) ||
    lat < -90 || lat > 90 ||
    lng < -180 || lng > 180
  ) {
    return null;
  }
  return { lat, lng };
}

/** Validate and truncate a chat message */
export function sanitizeMessage(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  if (trimmed.length === 0) return null;
  // Hard limit: 500 characters for chat messages
  return trimmed.slice(0, 500);
}
