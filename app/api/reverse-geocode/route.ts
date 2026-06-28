// ============================================================
// ClimaSense — Precise Reverse Geocode Endpoint
// GET /api/reverse-geocode?lat=19.01&lng=72.84
//
// Returns precise locality: neighbourhood/suburb/district/city/state
// Example: { city: "Mumbai", locality: "Parel", displayName: "Parel, Mumbai, Maharashtra, India" }
// ============================================================

import { NextRequest, NextResponse } from 'next/server';

const OW_KEY = process.env.OPENWEATHER_API_KEY;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat') ?? '0');
  const lng = parseFloat(searchParams.get('lng') ?? '0');

  if (!lat || !lng) {
    return NextResponse.json({ city: 'Unknown', locality: null, region: '', country: '', displayName: 'Unknown' });
  }

  // ── Nominatim: most precise locality data ─────────────────
  // Run this first — it gives neighbourhood/suburb/district level detail
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1&zoom=16`,
      {
        headers: { 'User-Agent': 'ClimaSense/1.0 (weather intelligence platform)' },
        next: { revalidate: 1800 }, // 30 min cache — locality doesn't change
      }
    );

    if (res.ok) {
      const data = await res.json();
      const addr = data?.address ?? {};

      // Build precise locality hierarchy
      const neighbourhood =
        addr.neighbourhood ??
        addr.suburb ??
        addr.quarter ??
        addr.hamlet ??
        null;

      const city =
        addr.city ??
        addr.town ??
        addr.municipality ??
        addr.village ??
        addr.county ??
        'Unknown';

      const district = addr.city_district ?? addr.district ?? null;
      const region = addr.state ?? addr.region ?? '';
      const country = addr.country ?? addr.country_code?.toUpperCase() ?? '';

      // Build display name: most precise → least precise
      const parts = [neighbourhood ?? district, city, region, country]
        .filter(Boolean)
        .filter((v, i, arr) => arr.indexOf(v) === i); // deduplicate

      const displayName = parts.join(', ');
      const locality = neighbourhood ?? district ?? city;

      return NextResponse.json({
        city,
        locality,
        neighbourhood,
        district,
        region,
        country,
        displayName,
      });
    }
  } catch { /* fall through to OW */ }

  // ── OpenWeather fallback (city-level only) ────────────────
  if (OW_KEY) {
    try {
      const res = await fetch(
        `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lng}&limit=1&appid=${OW_KEY}`,
        { next: { revalidate: 3600 } }
      );
      if (res.ok) {
        const data = await res.json();
        if (data?.[0]) {
          const { name, state = '', country = '' } = data[0];
          const displayName = [name, state, country].filter(Boolean).join(', ');
          return NextResponse.json({
            city: name,
            locality: name,
            neighbourhood: null,
            district: null,
            region: state,
            country,
            displayName,
          });
        }
      }
    } catch { /* silent */ }
  }

  return NextResponse.json({
    city: 'Unknown',
    locality: null,
    neighbourhood: null,
    district: null,
    region: '',
    country: '',
    displayName: 'Unknown',
  });
}
