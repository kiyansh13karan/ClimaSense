// ============================================================
// ClimaSense — IP-based Location Fallback
// GET /api/ip-location
// Used when browser GPS is denied or unavailable.
// Uses ipapi.co (free, no key needed, 1000 req/day).
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Get client IP from headers (works on Vercel/Next.js)
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : null;

  // Skip for localhost/private IPs
  const isLocal =
    !ip ||
    ip === '127.0.0.1' ||
    ip === '::1' ||
    ip.startsWith('192.168.') ||
    ip.startsWith('10.') ||
    ip.startsWith('172.');

  if (isLocal) {
    // Return a sensible default for local dev
    return NextResponse.json({
      city: 'Houston',
      region: 'Texas',
      country: 'US',
      lat: 29.7604,
      lng: -95.3698,
      displayName: 'Houston, Texas',
    });
  }

  try {
    const res = await fetch(`https://ipapi.co/${ip}/json/`, {
      headers: { 'User-Agent': 'ClimaSense/1.0' },
      next: { revalidate: 3600 },
    });

    if (!res.ok) throw new Error('ipapi failed');
    const data = await res.json();

    if (data?.error) throw new Error(data.reason ?? 'ipapi error');

    const city: string = data.city ?? 'Unknown';
    const region: string = data.region ?? '';
    const country: string = data.country_code ?? '';
    const lat: number = parseFloat(data.latitude ?? '0');
    const lng: number = parseFloat(data.longitude ?? '0');

    const displayName = [city, region, country].filter(Boolean).join(', ');

    return NextResponse.json({ city, region, country, lat, lng, displayName });
  } catch {
    // Final fallback
    return NextResponse.json({
      city: 'Houston',
      region: 'Texas',
      country: 'US',
      lat: 29.7604,
      lng: -95.3698,
      displayName: 'Houston, Texas',
    });
  }
}
